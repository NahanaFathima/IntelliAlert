from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login():
    return {"message": "Login API"}

@router.post("/register")
def register():
    return {"message": "Register API"}