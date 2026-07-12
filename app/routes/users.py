from fastapi import APIRouter

router = APIRouter()

@router.get("/{user_id}")
def get_user(user_id: str):
    return {"user_id": user_id}

@router.post("/profile")
def create_profile():
    return {"message": "Profile Created"}