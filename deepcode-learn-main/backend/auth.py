from fastapi import APIRouter, Request, HTTPException, Depends
from firebase_admin import auth as firebase_auth, firestore


router = APIRouter()

def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    print("🔍 Received header:", auth_header)  # DEBUG

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No auth token")

    token = auth_header.split(" ")[1]
    print("🔐 Verifying token:", token[:30], "...")  # DEBUG

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        print("✅ Token verified:", decoded_token)
        return decoded_token
    except Exception as e:
        print("❌ Invalid token:", e)
        raise HTTPException(status_code=403, detail="Invalid token")

@router.get("/get-role")
def get_role(decoded_token=Depends(verify_token)):
    db = firestore.client()
    uid = decoded_token["uid"]
    doc = db.collection("users").document(uid).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")

    role = doc.to_dict().get("role")
    if not role:
        raise HTTPException(status_code=400, detail="Unknown role")

    return {"role": role}




