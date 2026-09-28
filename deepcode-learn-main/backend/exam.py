from fastapi import APIRouter, Request, HTTPException, Depends
from firebase_admin import firestore, auth as firebase_auth
from pydantic import BaseModel
from datetime import datetime
from typing import List
from llm import evaluate_code_with_tests


router = APIRouter()

def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No auth token")
    token = auth_header.split(" ")[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print("❌ Invalid token:", e)
        raise HTTPException(status_code=403, detail="Invalid token")

class TestCase(BaseModel):
    input: str
    output: str

class Exam(BaseModel):
    title: str
    description: str
    language: str
    tests: List[TestCase]


# 📌 Exam Submission Model
class ExamSubmission(BaseModel):
    exam_id: str
    code: str
    language: str
    score: float  # LLM-assessed score (0 to 100)
    output: str   # Output returned from execution
    student_email: str

@router.post("/create-exam")
def create_exam(exam: Exam, decoded_token=Depends(verify_token)):
    db = firestore.client()
    data = exam.dict()
    data["createdAt"] = datetime.utcnow().isoformat()
    data["createdBy"] = decoded_token["uid"]  # Optional: track which prof created it
    db.collection("exams").add(data)
    return {"message": "✅ Exam created"}

@router.get("/get-exams")
def get_exams(request: Request):
    db = firestore.client()
    exams_ref = db.collection("exams").stream()
    exams = [doc.to_dict() | {"id": doc.id} for doc in exams_ref]
    return exams




@router.post("/submit-exam")
def submit_exam(submission: ExamSubmission, decoded_token=Depends(verify_token)):
    db = firestore.client()

    exam_doc = db.collection("exams").document(submission.exam_id).get()
    if not exam_doc.exists:
        raise HTTPException(status_code=404, detail="Exam not found")

    test_cases = exam_doc.to_dict().get("tests", [])

    # ✅ Evaluate using DeepSeek - NO FEEDBACK, equal test+similarity weight
    from llm import evaluate_code_with_tests
    result = evaluate_code_with_tests(submission.code, test_cases, weight_tests=0.5, weight_similarity=0.5, feedback=False)

    submission_data = submission.dict()
    submission_data["submitted_at"] = datetime.utcnow().isoformat()
    submission_data["score"] = result["score"]
    submission_data["output_log"] = result["output_log"]
    submission_data["similarity"] = result["similarity"]
    submission_data["ideal_code"] = result["ideal_code"]

    db.collection("exam_results").add(submission_data)

    return {
        "message": "✅ Exam submitted and evaluated",
        "score": result["score"],
        "passed": result["passed"],
        "total": result["total"],
        "similarity": result["similarity"],
    }



# 📌 Professor sees results for their exam
@router.get("/get-results/{exam_id}")
def get_results_for_exam(exam_id: str, decoded_token=Depends(verify_token)):
    db = firestore.client()
    results = db.collection("exam_results").where("exam_id", "==", exam_id).stream()
    all_results = [res.to_dict() for res in results]
    return all_results


@router.get("/get-my-exams")
def get_my_exams(decoded_token=Depends(verify_token)):
    db = firestore.client()
    prof_uid = decoded_token["uid"]
    exams_ref = db.collection("exams").where("createdBy", "==", prof_uid).stream()
    
    exams = []
    for doc in exams_ref:
        exam_data = doc.to_dict()
        exam_data["id"] = doc.id

        # Fetch results for this exam
        results_ref = db.collection("exam_results").where("exam_id", "==", doc.id).stream()
        results = [r.to_dict() for r in results_ref]
        exam_data["results"] = results

        exams.append(exam_data)

    return exams
