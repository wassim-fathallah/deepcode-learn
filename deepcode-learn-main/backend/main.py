# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
import firebase_admin
from firebase_admin import credentials
from exam import router as exam_router
from submit import router as submit_router
from correction import router as correction_router



# ✅ INIT Firebase Admin SDK
cred = credentials.Certificate("firebase-adminsdk.json")  # Replace with full path if needed
firebase_admin.initialize_app(cred)

app = FastAPI()
app.include_router(auth_router)
app.include_router(exam_router)
app.include_router(submit_router)
app.include_router(correction_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


