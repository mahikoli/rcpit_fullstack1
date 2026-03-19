from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
import bcrypt
import os

# Create FastAPI app
app = FastAPI()

# Enable CORS (Relaxed for debugging)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chic-meerkat-8474e2.netlify.app"],  # 👈 tumhara frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL Connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Test Connection on Startup

def test_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# Data Model
class RegisterData(BaseModel):
    name: str
    email: str
    password: str
    role: str
    mobile: str = ""
    year: str = ""
    qualification: str = ""

class IssueCreate(BaseModel):
    equipment_type: str
    lab_name: str
    room_name: str
    equipment_name: str
    equipment_id: str
    description: str
    user_name: str
    email: str
    prn: str

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
                INSERT INTO users (name, email, password, role, mobile, year, qualification)
                VALUES (:name, :email, :password, :role, :mobile, :year, :qualification)
            """),
            {
                "name": data.name,
                "email": data.email,
                "password": hashed_password,
                "role": data.role,
                "mobile": data.mobile,
                "year": data.year,
                "qualification": data.qualification
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

# Issues APIs
@app.post("/issues")
def create_issue(data: IssueCreate):
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO issues (
                        equipment_type, lab_name, room_name, equipment_name, 
                        equipment_id, description, user_name, email, prn
                    ) VALUES (
                        :equipment_type, :lab_name, :room_name, :equipment_name, 
                        :equipment_id, :description, :user_name, :email, :prn
                    )
                """),
                {
                    "equipment_type": data.equipment_type,
                    "lab_name": data.lab_name,
                    "room_name": data.room_name,
                    "equipment_name": data.equipment_name,
                    "equipment_id": data.equipment_id,
                    "description": data.description,
                    "user_name": data.user_name,
                    "email": data.email,
                    "prn": data.prn
                }
            )
            conn.commit()
        return {"message": "Issue reported successfully"}
    except Exception as e:
        print(f"Error reporting issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/issues")
def get_issues():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM issues ORDER BY created_at DESC"))
            issues = []
            for row in result:
                issues.append({
                    "id": row[0],
                    "equipment_type": row[1],
                    "lab_name": row[2],
                    "room_name": row[3],
                    "equipment_name": row[4],
                    "equipment_id": row[5],
                    "description": row[6],
                    "user_name": row[7],
                    "email": row[8],
                    "prn": row[9],
                    "status": row[10],
                    "priority": row[11],
                    "created_at": str(row[12])
                })
            return issues
    except Exception as e:
        print(f"Error fetching issues: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/users")
def get_users():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, name, email, role, mobile, year, qualification FROM users"))
            users = []
            for row in result:
                users.append({
                    "id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "role": row[3],
                    "mobile": row[4],
                    "year": row[5],
                    "qualification": row[6]
                })
            return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
@app.get("/")
def home():
    return {"message": "Backend running successfully"}