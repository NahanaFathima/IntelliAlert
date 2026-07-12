from app.database.firebase import db

db.collection("users").document("test").set({
    "name": "Hackathon Test"
})

print("Firestore Connected Successfully!")