from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
import bcrypt

# Create FastAPI app
app = FastAPI()

# Enable CORS (Very Important for React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL Connection
engine = create_engine("mysql+pymysql://root:mahiKOLI1137@localhost/maintainance_system")

# Data Model
class RegisterData(BaseModel):
    name: str
    email: str
    password: str
    role: str

# Register API
@app.post("/register")
def register(data: RegisterData):

    # Hash password
    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    with engine.connect() as conn:

        # Check if email already exists
        check_user = conn.execute(
            text("SELECT * FROM users WHERE email=:email"),
            {"email": data.email}
        ).fetchone()

        if check_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        # Insert user
        conn.execute(
            text("""
                INSERT INTO users (name, email, password, role)
                VALUES (:name, :email, :password, :role)
            """),
            {
                "name": data.name,
                "email": data.email,
                "password": hashed_password,
                "role": data.role
            }
        )

        conn.commit()

    return {"message": "User registered successfully"}
SECRET_KEY = "mysecretkey"

class LoginData(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(data: LoginData):

    with engine.connect() as conn:

        user = conn.execute(
            text("SELECT * FROM users WHERE email=:email"),
            {"email": data.email}
        ).fetchone()

        if not user:
            raise HTTPException(status_code=400, detail="Invalid Email")

        stored_password = user[3]

        if not bcrypt.checkpw(data.password.encode("utf-8"), stored_password.encode("utf-8")):
            raise HTTPException(status_code=400, detail="Invalid Password")

        token = jwt.encode(
            {"user_id": user[0], "role": user[4]},
            SECRET_KEY,
            algorithm="HS256"
        )

    return {"message": "Login successful", "token": token, "role": user[4]}
@app.get("/")
def home():
    return {"message": "Backend running successfully"}