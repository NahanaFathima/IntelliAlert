from fastapi import FastAPI

from app.routes import announcement
from app.routes import auth
from app.routes import users

app = FastAPI(
    title="IntelliAlert API",
    version="1.0"
)

app.include_router(
    announcement.router,
    prefix="/announcement",
    tags=["Announcement"]
)

app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

@app.get("/")
def home():
    return {"message": "IntelliAlert Backend Running"}