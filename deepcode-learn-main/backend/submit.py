# submit.py
from fastapi import APIRouter
from pydantic import BaseModel
from llm import evaluate_code_with_tests
import os
import json

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class CodeSubmission(BaseModel):
    problem_id: int
    student_code: str
    language: str = "python"

@router.post("/submit/")
def submit_code(submission: CodeSubmission):
    try:
        # ✅ Load test cases from problems dataset
        problems_filename = f"{submission.language}_problems.json"
        problems_file = os.path.join(BASE_DIR, '..', 'frontend', 'public', 'data', problems_filename)
        with open(problems_file, "r", encoding="utf-8") as f:
            problems = json.load(f)

        problem = problems[submission.problem_id]
        tests = problem.get("tests", [])
        
        # ✅ Evaluate with LLM (with feedback!)
        result = evaluate_code_with_tests(
            code=submission.student_code,
            test_cases=tests,
            weight_tests=0.7,
            weight_similarity=0.3,
            feedback=True
        )

        return result

    except Exception as e:
        return {
            "error": str(e)
        }
