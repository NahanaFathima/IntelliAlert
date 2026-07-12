from fastapi import APIRouter

router = APIRouter()

@router.post("/process")
def process():
    return {
        "relevant": True,
        "priority": "HIGH",
        "title": "Platform Changed",
        "message": "Your train has moved to Platform 5.",
        "timeRemaining": "8 minutes",
        "recommendedAction": "Proceed to Platform 5",
        "routeRequired": True
    }