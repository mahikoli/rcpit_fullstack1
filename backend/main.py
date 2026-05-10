from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import create_engine, text
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
# Create FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MySQL Connection
SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

if not SECRET_KEY:
    raise Exception("SECRET_KEY not found in .env file")

# Fix mysql:// to mysql+pymysql://
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in .env file")

try:
    engine = create_engine(DATABASE_URL)
except Exception as e:
    print(f"Could not create database engine: {e}")
    raise

# Test Connection on Startup
@app.on_event("startup")
def startup_event():
    test_db_connection()

def test_db_connection():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            # Auto-create equipments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS equipments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    unique_id VARCHAR(100) UNIQUE NOT NULL,
                    equipment_type VARCHAR(50),
                    lab_name VARCHAR(100),
                    room_name VARCHAR(100),
                    equipment_name VARCHAR(100)
                )
            """))
            # Auto-create issues table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS issues (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    equipment_type VARCHAR(50),
                    lab_name VARCHAR(100),
                    room_name VARCHAR(100),
                    equipment_name VARCHAR(100),
                    equipment_id VARCHAR(100),
                    description TEXT,
                    user_name VARCHAR(100),
                    email VARCHAR(100),
                    prn VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'Pending',
                    priority VARCHAR(50) DEFAULT 'Medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    technician_id INT NULL,
                    technician_name VARCHAR(100) NULL,
                    estimated_days VARCHAR(50) NULL,
                    technician_comment TEXT NULL,
                    issue_subtype VARCHAR(100) NULL,
                    user_confirmed BOOLEAN DEFAULT FALSE,
                    resolved_at TIMESTAMP NULL
                )
            """))
            
            # Create specialized user tables
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    mobile VARCHAR(15),
                    year VARCHAR(50)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS staff (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    mobile VARCHAR(15),
                    qualification VARCHAR(100),
                    lab_name VARCHAR(100),
                    room_number VARCHAR(100)
                )
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    field_name VARCHAR(50) DEFAULT 'IT'
                )
            """))

            # Ensure new columns exist for existing tables
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN technician_id INT NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN technician_name VARCHAR(100) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN estimated_days VARCHAR(50) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN technician_comment TEXT NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE admins ADD COLUMN field_name VARCHAR(50) DEFAULT 'IT'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN issue_subtype VARCHAR(100) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN reporter_count INT DEFAULT 1"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN reporter_emails TEXT NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE admins ADD COLUMN admin_role VARCHAR(50) DEFAULT 'superadmin'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE admins ADD COLUMN department VARCHAR(100) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE students ADD COLUMN department VARCHAR(100) DEFAULT 'IT'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN student_dept VARCHAR(100) DEFAULT 'IT'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN is_escalated BOOLEAN DEFAULT FALSE"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN escalated_at TIMESTAMP NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE admins ADD COLUMN mobile VARCHAR(20) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE staff ADD COLUMN field_name VARCHAR(50) DEFAULT 'IT'"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE staff ADD COLUMN department VARCHAR(100) NULL"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN user_confirmed BOOLEAN DEFAULT FALSE"))
            except Exception: pass
            try:
                conn.execute(text("ALTER TABLE issues ADD COLUMN resolved_at TIMESTAMP NULL"))
            except Exception: pass

            # Auto-create notifications table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    target_role VARCHAR(50) NULL,
                    target_email VARCHAR(100) NULL,
                    message TEXT,
                    issue_id INT,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # Auto-create notices table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notices (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    body TEXT NOT NULL,
                    posted_by VARCHAR(100) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # Auto-create complaints table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS complaints (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_name VARCHAR(100),
                    student_email VARCHAR(100),
                    department VARCHAR(100),
                    lab_assistant_name VARCHAR(100) NOT NULL,
                    lab_name VARCHAR(100),
                    description TEXT NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            conn.commit()
            print("Database connection successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")

# Data Model
class NoticeCreate(BaseModel):
    title: str
    body: str
    posted_by: str = ""

class ComplaintCreate(BaseModel):
    student_name: str
    student_email: str
    department: str
    lab_assistant_name: str
    lab_name: str
    description: str

class RegisterData(BaseModel):
    name: str
    email: str
    password: str
    mobile: str = ""
    role: str
    year: str = ""
    qualification: str = ""
    lab_name: str = ""
    room_number: str = ""
    department: str = "IT"

class EquipmentCreate(BaseModel):
    unique_id: str
    equipment_type: str
    lab_name: str
    room_name: str
    equipment_name: str

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
    issue_subtype: str = ""
    student_dept: str = "IT"

class IssueAssign(BaseModel):
    technician_id: int
    technician_name: str

class IssueStatusUpdate(BaseModel):
    status: str
    estimated_days: str = ""
    comment: str = ""

class NotificationResponse(BaseModel):
    id: int
    message: str
    issue_id: int
    is_read: bool
    created_at: str

@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return {"message": "OK"}
# Register API
@app.post("/register")
def register(data: RegisterData):

    # Hash password
    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    with engine.connect() as conn:
        # Check in all tables if email already exists
        for table in ["students", "staff", "admins"]:
            check_user = conn.execute(
                text(f"SELECT email FROM {table} WHERE email=:email"),
                {"email": data.email}
            ).fetchone()
            if check_user:
                raise HTTPException(status_code=400, detail="Email already exists")

        # Insert user into specific table based on role
        if data.role.lower() == "user":
            conn.execute(
                text("INSERT INTO students (name, email, password, mobile, year, department) VALUES (:name, :email, :password, :mobile, :year, :dept)"),
                {"name": data.name, "email": data.email, "password": hashed_password, "mobile": data.mobile, "year": data.year, "dept": data.department}
            )
        elif data.role.lower() == "staff":
            conn.execute(
                text("INSERT INTO staff (name, email, password, mobile, qualification, lab_name, room_number, department, field_name) VALUES (:name, :email, :password, :mobile, :qualification, :lab_name, :room_number, :dept, :field)"),
                {"name": data.name, "email": data.email, "password": hashed_password, "mobile": data.mobile, "qualification": data.qualification, "lab_name": data.lab_name, "room_number": data.room_number, "dept": data.department, "field": data.department}
            )
        elif data.role.lower() == "admin" or data.role.lower() == "hod":
            admin_role = "hod" if data.role.lower() == "hod" else "superadmin"
            # Map full department name to field code
            field_name = "IT"
            if "Electrical" in data.department:
                field_name = "Electrical"
            elif "Computer" in data.department or "Information Technology" in data.department:
                field_name = "IT"

            conn.execute(
                text("INSERT INTO admins (name, email, password, admin_role, department, mobile, field_name) VALUES (:name, :email, :password, :role, :dept, :mobile, :field)"),
                {"name": data.name, "email": data.email, "password": hashed_password, "role": admin_role, "dept": data.department, "mobile": data.mobile, "field": field_name}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid role specified")

        conn.commit()

    return {"message": "User registered successfully"}


class LoginData(BaseModel):
    email: str
    password: str

class ProfileUpdate(BaseModel):
    email: str
    role: str
    name: Optional[str] = None
    mobile: Optional[str] = None
    department: Optional[str] = None
    qualification: Optional[str] = None
    lab_name: Optional[str] = None
    room_number: Optional[str] = None
    year: Optional[str] = None

@app.post("/login")
def login(data: LoginData):
    with engine.connect() as conn:
        user = None
        role = ""
        field_name = None
        admin_role = None
        department = None
        mobile = None
        year = None
        qualification = None
        lab_name = None
        room_number = None
        
        # Search across all tables
        # Check Admins
        res = conn.execute(text("SELECT id, name, email, password, field_name, admin_role, department, mobile FROM admins WHERE email=:email"), {"email": data.email}).fetchone()
        if res:
            user = res
            role = "admin"
            field_name = res[4]
            admin_role = res[5]
            department = res[6]
            mobile = res[7]
        
        # Check Staff if not found in admins
        if not user:
            res = conn.execute(text("SELECT id, name, email, password, field_name, department, mobile, qualification, lab_name, room_number FROM staff WHERE email=:email"), {"email": data.email}).fetchone()
            if res:
                user = res
                role = "staff"
                field_name = res[4]
                admin_role = "staff"
                department = res[5]
                mobile = res[6]
                qualification = res[7]
                lab_name = res[8]
                room_number = res[9]
        
        # Check Students if not found in staff/admins
        if not user:
            res = conn.execute(text("SELECT id, name, email, password, department, mobile, year FROM students WHERE email=:email"), {"email": data.email}).fetchone()
            if res:
                user = res
                role = "User"
                admin_role = "user"
                department = res[4]
                mobile = res[5]
                year = res[6]
        

        if not user:
            raise HTTPException(status_code=400, detail="Invalid Email")

        stored_password = user[3] # password is 4th col (idx 3)

        try:
            # Add a check for valid bcrypt hash format to prevent 500 on malformed input (e.g. plain text)
            valid_pass = bcrypt.checkpw(data.password.encode("utf-8"), stored_password.encode("utf-8"))
        except (ValueError, TypeError) as e:
            print(f"Auth Warning: Malformed password hash for user {data.email}: {e}")
            valid_pass = False

        if not valid_pass:
            raise HTTPException(status_code=400, detail="Invalid Password")

        token = jwt.encode(
            {"user_id": user[0], "role": role},
            SECRET_KEY,
            algorithm="HS256"
        )

        return {
            "message": "Login successful", 
            "token": token, 
            "role": role, 
            "user_id": user[0], 
            "user_name": user[1],
            "user_email": user[2],
            "user_mobile": mobile,
            "field_name": field_name,
            "admin_role": admin_role,
            "department": department,
            "year": year,
            "qualification": qualification if role == "staff" else None,
            "lab_name": lab_name if role == "staff" else None,
            "room_number": room_number if role == "staff" else None
        }

@app.put("/profile/update")
def update_profile(data: ProfileUpdate):
    try:
        with engine.connect() as conn:
            if data.role.lower() == "admin":
                conn.execute(
                    text("""
                        UPDATE admins 
                        SET name = :name, mobile = :mobile, department = :dept, field_name = :field 
                        WHERE email = :email
                    """),
                    {
                        "name": data.name, 
                        "mobile": data.mobile, 
                        "dept": data.department, 
                        "field": data.department, 
                        "email": data.email
                    }
                )
            elif data.role.lower() == "staff":
                conn.execute(
                    text("""
                        UPDATE staff 
                        SET name = :name, mobile = :mobile, department = :dept, field_name = :field,
                            qualification = :qual, lab_name = :lab, room_number = :room
                        WHERE email = :email
                    """),
                    {
                        "name": data.name,
                        "mobile": data.mobile,
                        "dept": data.department,
                        "field": data.department,
                        "qual": data.qualification,
                        "lab": data.lab_name,
                        "room": data.room_number,
                        "email": data.email
                    }
                )
            elif data.role.lower() == "user":
                conn.execute(
                    text("""
                        UPDATE students 
                        SET name = :name, mobile = :mobile, department = :dept, year = :year
                        WHERE email = :email
                    """),
                    {
                        "name": data.name,
                        "mobile": data.mobile,
                        "dept": data.department,
                        "year": data.year,
                        "email": data.email
                    }
                )
            conn.commit()
            return {"message": "Profile updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Health Check / Auto Escalation & Confirmation Logic
def check_and_run_background_tasks():
    try:
        with engine.connect() as conn:
            # 1. Escalation: Find issues > 10 days old, not completed, not already escalated
            conn.execute(
                text("""
                    UPDATE issues 
                    SET is_escalated = TRUE, escalated_at = CURRENT_TIMESTAMP
                    WHERE created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 10 DAY)
                      AND status NOT IN ('Completed', 'Resolved')
                      AND is_escalated = FALSE
                """)
            )
            
            # 2. Auto-Confirmation: Find issues Resolved > 2 days ago
            expired_resolved = conn.execute(
                text("""
                    SELECT id, equipment_name FROM issues 
                    WHERE status = 'Resolved' 
                      AND resolved_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY)
                      AND user_confirmed = FALSE
                """)
            ).fetchall()
            
            for row in expired_resolved:
                issue_id = row[0]
                eq_name = row[1]
                
                # Update status to Completed
                conn.execute(
                    text("UPDATE issues SET status='Completed', user_confirmed=TRUE WHERE id=:id"),
                    {"id": issue_id}
                )
                
                # Notify Admin of automatic completion
                conn.execute(
                    text("INSERT INTO notifications (target_role, message, issue_id) VALUES ('admin', :msg, :iid)"),
                    {"msg": f"Issue #ISS-{issue_id} ({eq_name}) automatically confirmed after 2 days.", "iid": issue_id}
                )
                
            conn.commit()
    except Exception as e:
        print(f"Background Tasks Error: {e}")

# Issues APIs
@app.post("/issues")
def create_issue(data: IssueCreate):
    try:
        with engine.connect() as conn:
            # 1. Check for Duplicate Issue (Excluding Completed)
            duplicate = conn.execute(
                text("""
                    SELECT id, description, reporter_emails 
                    FROM issues 
                    WHERE lab_name = :lab 
                      AND room_name = :room 
                      AND issue_subtype = :subtype 
                      AND status != 'Completed'
                      AND (
                        (equipment_id <> '' AND equipment_id = :eq_id) 
                        OR 
                        ((equipment_id = '' OR :eq_id = '') AND equipment_name = :eq_name)
                      )
                    LIMIT 1
                """),
                {
                    "lab": data.lab_name,
                    "room": data.room_name,
                    "eq_id": data.equipment_id,
                    "eq_name": data.equipment_name,
                    "subtype": data.issue_subtype
                }
            ).fetchone()

            if duplicate:
                dup_id, dup_desc, dup_emails = duplicate
                # Check if current user is already a reporter
                emails_list = (dup_emails or "").split(",")
                if data.email in emails_list:
                    raise HTTPException(status_code=400, detail="You have already reported/joined this issue.")
                
                # Return Conflict with duplicate info
                return {
                    "duplicate": True, 
                    "issue_id": dup_id, 
                    "existing_description": dup_desc,
                    "message": "A similar issue has already been reported. Would you like to join the existing request?"
                }

            # 2. Look for a matching technician by lab_name
            tech = conn.execute(
                text("SELECT id, name, email FROM staff WHERE lab_name = :lab LIMIT 1"),
                {"lab": data.lab_name}
            ).fetchone()
            
            tech_id = None
            tech_name = None
            tech_email = None
            status = "Pending"
            
            if tech:
                tech_id = tech[0]
                tech_name = tech[1]
                tech_email = tech[2]
                status = "Assigned"
            
            # 3. Insert the issue with auto-assigned details if found
            result = conn.execute(
                text("""
                    INSERT INTO issues (
                        equipment_type, lab_name, room_name, equipment_name, 
                        equipment_id, description, user_name, email, prn,
                        status, technician_id, technician_name, issue_subtype,
                        reporter_count, reporter_emails, student_dept
                    ) VALUES (
                        :equipment_type, :lab_name, :room_name, :equipment_name, 
                        :equipment_id, :description, :user_name, :email, :prn,
                        :status, :tech_id, :tech_name, :issue_subtype,
                        1, :email, :dept
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
                    "prn": data.prn,
                    "status": status,
                    "tech_id": tech_id,
                    "tech_name": tech_name,
                    "issue_subtype": data.issue_subtype,
                    "dept": data.student_dept
                }
            )
            
            new_issue_id = result.lastrowid
            
            # 4. Create notification for the auto-assigned technician
            if tech_email:
                conn.execute(
                    text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
                    {"email": tech_email, "msg": f"New issue auto-assigned: {data.equipment_name} in {data.lab_name} (Auto)", "iid": new_issue_id}
                )

            conn.commit()
        return {"message": "Issue reported successfully"}
    except Exception as e:
        print(f"Error reporting issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/issues/{issue_id}/join")
def join_issue(issue_id: int, data: dict):
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
        
    try:
        with engine.connect() as conn:
            # 1. Get current data
            issue = conn.execute(
                text("SELECT reporter_emails, equipment_name, technician_email FROM (SELECT i.*, s.email as technician_email FROM issues i LEFT JOIN staff s ON i.technician_id = s.id WHERE i.id = :id) t"),
                {"id": issue_id}
            ).fetchone()
            
            if not issue:
                # Fallback if JOIN is complex or failed
                issue = conn.execute(
                    text("SELECT reporter_emails, equipment_name, technician_id FROM issues WHERE id=:id"),
                    {"id": issue_id}
                ).fetchone()
                tech_email = None
                if issue and issue[2]:
                    tech = conn.execute(text("SELECT email FROM staff WHERE id=:id"), {"id": issue[2]}).fetchone()
                    if tech: tech_email = tech[0]
            else:
                tech_email = issue[2]

            if not issue:
                raise HTTPException(status_code=404, detail="Issue not found")
            
            emails_list = (issue[0] or "").split(",")
            if email in emails_list:
                return {"message": "You have already joined this issue"}
            
            new_emails = issue[0] + "," + email if issue[0] else email
            
            # 2. Update count and emails
            conn.execute(
                text("UPDATE issues SET reporter_count = reporter_count + 1, reporter_emails = :emails WHERE id = :id"),
                {"emails": new_emails, "id": issue_id}
            )
            
            # 3. Notify Technician
            if tech_email:
                conn.execute(
                    text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
                    {"email": tech_email, "msg": f"Another user joined report for {issue[1]} (#ISS-{issue_id})", "iid": issue_id}
                )
            
            conn.commit()
        return {"message": "Joined existing issue successfully"}
    except Exception as e:
        print(f"Error joining issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/issues/{issue_id}")
def delete_issue(issue_id: int):
    try:
        with engine.connect() as conn:
            # Check if issue exists
            res = conn.execute(text("SELECT id FROM issues WHERE id=:id"), {"id": issue_id}).fetchone()
            if not res:
                raise HTTPException(status_code=404, detail="Issue not found")
                
            conn.execute(text("DELETE FROM issues WHERE id=:id"), {"id": issue_id})
            # Also cleanup associated notifications
            conn.execute(text("DELETE FROM notifications WHERE issue_id=:id"), {"id": issue_id})
            conn.commit()
        return {"message": "Issue deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/issues")
def get_issues(field: str = None, admin_role: str = None, dept: str = None):
    check_and_run_background_tasks() # Run background checks on every fetch
    try:
        with engine.connect() as conn:
            query = "SELECT * FROM issues WHERE 1=1"
            params = {}
            if field:
                query += " AND equipment_type = :field"
                params["field"] = field
                
            # If user is a HOD, only show ESCALATED issues of their department
            if admin_role == "hod":
                query += " AND is_escalated = TRUE"
                if dept:
                    query += " AND student_dept = :dept"
                    params["dept"] = dept
                    
            query += " ORDER BY created_at DESC"
            
            result = conn.execute(text(query), params)
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
                    "created_at": str(row[12]),
                    "technician_id": row[13],
                    "technician_name": row[14],
                    "estimated_days": row[15] if len(row) > 15 else None,
                    "technician_comment": row[16] if len(row) > 16 else None,
                    "issue_subtype": row[17] if len(row) > 17 else None,
                    "reporter_count": row[18] if len(row) > 18 else 1,
                    "student_dept": row[20] if len(row) > 20 else "IT",
                    "is_escalated": row[21] if len(row) > 21 else False
                })
            return issues
    except Exception as e:
        print(f"Error fetching issues: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/technicians")
def get_technicians():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, name, email FROM staff"))
            techs = []
            for row in result:
                techs.append({
                    "id": row._mapping['id'],
                    "name": row._mapping['name'],
                    "email": row._mapping['email']
                })
            return techs
    except Exception as e:
        print(f"Error fetching technicians: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.put("/issues/{issue_id}/assign")
def assign_issue(issue_id: int, data: IssueAssign):
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    UPDATE issues 
                    SET technician_id=:tech_id, technician_name=:tech_name, status='Assigned'
                    WHERE id=:issue_id
                """),
                {
                    "tech_id": data.technician_id,
                    "tech_name": data.technician_name,
                    "issue_id": issue_id
                }
            )
            conn.commit()
        return {"message": "Issue assigned successfully"}
    except Exception as e:
        print(f"Error assigning issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/issues/technician/{tech_id}")
def get_technician_issues(tech_id: int):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM issues WHERE technician_id=:tech_id ORDER BY created_at DESC"),
                {"tech_id": tech_id}
            )
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
                    "created_at": str(row[12]),
                    "technician_id": row[13],
                    "technician_name": row[14],
                    "estimated_days": row[15] if len(row) > 15 else None,
                    "technician_comment": row[16] if len(row) > 16 else None,
                    "issue_subtype": row[17] if len(row) > 17 else None,
                    "reporter_count": row[18] if len(row) > 18 else 1,
                    "student_dept": row[20] if len(row) > 20 else "IT",
                    "is_escalated": row[21] if len(row) > 21 else False
                })
            return issues
    except Exception as e:
        print(f"Error fetching technician issues: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.put("/issues/{issue_id}/status")
def update_issue_status(issue_id: int, data: IssueStatusUpdate):
    try:
        with engine.connect() as conn:
            # Get issue details first to find the reporter (for notification)
            issue = conn.execute(
                text("SELECT email, equipment_name FROM issues WHERE id=:id"),
                {"id": issue_id}
            ).fetchone()

            conn.execute(
                text("""
                    UPDATE issues 
                    SET status=:status, estimated_days=:days, technician_comment=:comment 
                    WHERE id=:issue_id
                """),
                {
                    "status": data.status, 
                    "days": data.estimated_days, 
                    "comment": data.comment, 
                    "issue_id": issue_id
                }
            )

            # If status is being set to "Resolved", record the time and reset user_confirmed
            if data.status == "Resolved":
                conn.execute(
                    text("UPDATE issues SET user_confirmed = FALSE, resolved_at = CURRENT_TIMESTAMP WHERE id = :id"),
                    {"id": issue_id}
                )
            elif data.status != "Completed":
                # If moving away from Resolved/Completed, clear resolved_at
                conn.execute(
                    text("UPDATE issues SET resolved_at = NULL WHERE id = :id"),
                    {"id": issue_id}
                )

            # Notifications Logic
            if issue:
                student_email = issue[0]
                eq_name = issue[1]
                
                # If moving to "In Progress" with estimated days
                if data.status == "In Progress" and data.estimated_days:
                    msg = f"Update on {eq_name}: Your request will take {data.estimated_days} days to resolve."
                    if data.comment:
                        msg += f" Note: {data.comment}"
                    
                    try:
                        conn.execute(
                            text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
                            {"email": student_email, "msg": msg, "iid": issue_id}
                        )
                    except Exception as e:
                        print(f"Notification Error (In Progress): {e}")

                # If completed, create standard notifications
                elif data.status == "Completed":
                    # Notify Student
                    try:
                        conn.execute(
                            text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
                            {"email": student_email, "msg": f"Your report for {eq_name} is now resolved!", "iid": issue_id}
                        )
                    except Exception as e:
                        print(f"Notification Error (Completed Student): {e}")
                    
                    # Notify Admin
                    try:
                        conn.execute(
                            text("INSERT INTO notifications (target_role, message, issue_id) VALUES ('admin', :msg, :iid)"),
                            {"msg": f"Issue #ISS-{issue_id} ({eq_name}) has been marked as Completed.", "iid": issue_id}
                        )
                    except Exception as e:
                        print(f"Notification Error (Completed Admin): {e}")

                # If technician marks as Resolved (User needs to confirm)
                elif data.status == "Resolved":
                    try:
                        conn.execute(
                            text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
                            {"email": student_email, "msg": f"Technician has fixed {eq_name}. Please confirm and close the request.", "iid": issue_id}
                        )
                    except Exception as e:
                        print(f"Notification Error (Resolved): {e}")

            conn.commit()
        return {"message": "Status updated successfully"}
    except Exception as e:
        print(f"Error updating issue status: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.put("/issues/{issue_id}/confirm")
def confirm_issue(issue_id: int):
    try:
        with engine.connect() as conn:
            # Check if issue exists and is Resolved
            issue = conn.execute(
                text("SELECT status FROM issues WHERE id=:id"),
                {"id": issue_id}
            ).fetchone()
            
            if not issue:
                raise HTTPException(status_code=404, detail="Issue not found")
            
            # Update to Completed and set confirmed flag
            conn.execute(
                text("UPDATE issues SET status='Completed', user_confirmed=TRUE WHERE id=:id"),
                {"id": issue_id}
            )
            
            # Notify Admin of final completion
            conn.execute(
                text("INSERT INTO notifications (target_role, message, issue_id) VALUES ('admin', :msg, :iid)"),
                {"msg": f"User confirmed completion of Issue #ISS-{issue_id}.", "iid": issue_id}
            )
            
            conn.commit()
            return {"message": "Issue confirmed and closed successfully"}
    except Exception as e:
        print(f"Error confirming issue: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
@app.get("/notifications/admin")
def get_admin_notifications():
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, message, issue_id, is_read, created_at FROM notifications WHERE target_role='admin' ORDER BY created_at DESC LIMIT 20")
            )
            return [dict(row._mapping) for row in result]
    except Exception as e:
        print(f"Error fetching admin notifications: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/notifications/user/{email}")
def get_user_notifications(email: str):
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT id, message, issue_id, is_read, created_at FROM notifications WHERE target_email=:email ORDER BY created_at DESC LIMIT 20"),
                {"email": email}
            )
            return [dict(row._mapping) for row in result]
    except Exception as e:
        print(f"Error fetching user notifications: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/users")
def get_users():
    try:
        with engine.connect() as conn:
            # Fetch Students
            student_res = conn.execute(text("SELECT id, name, email, mobile, year FROM students")).fetchall()
            # Fetch Staff
            staff_res = conn.execute(text("SELECT id, name, email, mobile, qualification, lab_name, room_number FROM staff")).fetchall()
            
            users = []
            for r in student_res:
                users.append({
                    "id": r[0], "name": r[1], "email": r[2], "role": "User", "mobile": r[3], "year": r[4], "qualification": ""
                })
            for r in staff_res:
                users.append({
                    "id": r[0], "name": r[1], "email": r[2], "role": "staff", "mobile": r[3], "year": "", 
                    "qualification": r[4], "lab_name": r[5], "room_number": r[6]
                })
            return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/")
def home():
    return {"message": "Backend running successfully"}

@app.post("/equipments")
def create_equipment(data: EquipmentCreate):
    try:
        with engine.connect() as conn:
            # Check if unique_id exists
            existing = conn.execute(
                text("SELECT id FROM equipments WHERE unique_id=:unique_id"),
                {"unique_id": data.unique_id}
            ).fetchone()
            if existing:
                raise HTTPException(status_code=400, detail="Equipment ID already exists")

            conn.execute(
                text("""
                    INSERT INTO equipments (unique_id, equipment_type, lab_name, room_name, equipment_name)
                    VALUES (:unique_id, :equipment_type, :lab_name, :room_name, :equipment_name)
                """),
                {
                    "unique_id": data.unique_id,
                    "equipment_type": data.equipment_type,
                    "lab_name": data.lab_name,
                    "room_name": data.room_name,
                    "equipment_name": data.equipment_name
                }
            )
            conn.commit()
        return {"message": "Equipment added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error adding equipment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/equipments")
def get_all_equipments(field: Optional[str] = None):
    try:
        with engine.connect() as conn:
            query = "SELECT unique_id, equipment_type, lab_name, room_name, equipment_name FROM equipments"
            params = {}
            if field:
                query += " WHERE equipment_type = :field"
                params["field"] = field
            
            query += " ORDER BY id DESC"
            result = conn.execute(text(query), params)
            equipments = []
            for row in result:
                equipments.append({
                    "unique_id": row[0],
                    "equipment_type": row[1],
                    "lab_name": row[2],
                    "room_name": row[3],
                    "equipment_name": row[4]
                })
            return equipments
    except Exception as e:
        print(f"Error fetching all equipments: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/equipments/{unique_id}")
def get_equipment(unique_id: str):
    try:
        with engine.connect() as conn:
            row = conn.execute(
                text("SELECT unique_id, equipment_type, lab_name, room_name, equipment_name FROM equipments WHERE unique_id=:unique_id"),
                {"unique_id": unique_id}
            ).fetchone()
            
            if not row:
                raise HTTPException(status_code=404, detail="Equipment not found")
                
            return {
                "unique_id": row[0],
                "equipment_type": row[1],
                "lab_name": row[2],
                "room_name": row[3],
                "equipment_name": row[4]
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching equipment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.put("/equipments/{unique_id}")
def update_equipment(unique_id: str, data: EquipmentCreate):
    try:
        with engine.connect() as conn:
            # Check if equipment exists
            existing = conn.execute(
                text("SELECT id FROM equipments WHERE unique_id=:unique_id"),
                {"unique_id": unique_id}
            ).fetchone()
            
            if not existing:
                raise HTTPException(status_code=404, detail="Equipment not found")

            conn.execute(
                text("""
                    UPDATE equipments 
                    SET equipment_type=:equipment_type, lab_name=:lab_name, 
                        room_name=:room_name, equipment_name=:equipment_name
                    WHERE unique_id=:unique_id
                """),
                {
                    "unique_id": unique_id,
                    "equipment_type": data.equipment_type,
                    "lab_name": data.lab_name,
                    "room_name": data.room_name,
                    "equipment_name": data.equipment_name
                }
            )
            conn.commit()
        return {"message": "Equipment updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating equipment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/equipments/{unique_id}")
def delete_equipment(unique_id: str):
    try:
        with engine.connect() as conn:
            # Check if equipment exists
            existing = conn.execute(
                text("SELECT id FROM equipments WHERE unique_id=:unique_id"),
                {"unique_id": unique_id}
            ).fetchone()
            
            if not existing:
                raise HTTPException(status_code=404, detail="Equipment not found")

            conn.execute(
                text("DELETE FROM equipments WHERE unique_id=:unique_id"),
                {"unique_id": unique_id}
            )
            conn.commit()
        return {"message": "Equipment deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting equipment: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# ── NOTICES API ──────────────────────────────────────────────────────────────

@app.post("/notices")
def create_notice(data: NoticeCreate):
    try:
        with engine.connect() as conn:
            conn.execute(
                text("INSERT INTO notices (title, body, posted_by) VALUES (:title, :body, :posted_by)"),
                {"title": data.title, "body": data.body, "posted_by": data.posted_by}
            )
            conn.commit()
        return {"message": "Notice posted successfully"}
    except Exception as e:
        print(f"Error posting notice: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/notices")
def get_notices():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, title, body, posted_by, created_at FROM notices ORDER BY created_at DESC"))
            notices = []
            for row in result:
                notices.append({
                    "id": row[0],
                    "title": row[1],
                    "body": row[2],
                    "posted_by": row[3],
                    "created_at": str(row[4])
                })
            return notices
    except Exception as e:
        print(f"Error fetching notices: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/notices/{notice_id}")
def delete_notice(notice_id: int):
    try:
        with engine.connect() as conn:
            existing = conn.execute(
                text("SELECT id FROM notices WHERE id=:id"), {"id": notice_id}
            ).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Notice not found")
            conn.execute(text("DELETE FROM notices WHERE id=:id"), {"id": notice_id})
            conn.commit()
        return {"message": "Notice deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting notice: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# ── COMPLAINTS API ──────────────────────────────────────────────────────────

@app.post("/complaints")
def submit_complaint(data: ComplaintCreate):
    try:
        with engine.connect() as conn:
            conn.execute(
                text("""
                    INSERT INTO complaints (student_name, student_email, department, lab_assistant_name, lab_name, description) 
                    VALUES (:s_name, :s_email, :dept, :la_name, :lab, :desc)
                """),
                {
                    "s_name": data.student_name,
                    "s_email": data.student_email,
                    "dept": data.department,
                    "la_name": data.lab_assistant_name,
                    "lab": data.lab_name,
                    "desc": data.description
                }
            )
            conn.commit()
        return {"message": "Complaint submitted successfully"}
    except Exception as e:
        print(f"Error submitting complaint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/complaints")
def get_complaints(department: str = None):
    try:
        with engine.connect() as conn:
            query = "SELECT id, student_name, student_email, department, lab_assistant_name, lab_name, description, status, created_at FROM complaints"
            params = {}
            if department:
                query += " WHERE department = :dept"
                params["dept"] = department
            
            query += " ORDER BY created_at DESC"
            
            result = conn.execute(text(query), params)
            complaints = []
            for row in result:
                complaints.append({
                    "id": row[0],
                    "student_name": row[1],
                    "student_email": row[2],
                    "department": row[3],
                    "lab_assistant_name": row[4],
                    "lab_name": row[5],
                    "description": row[6],
                    "status": row[7],
                    "created_at": str(row[8])
                })
            return complaints
    except Exception as e:
        print(f"Error fetching complaints: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.delete("/complaints/{complaint_id}")
def delete_complaint(complaint_id: int):
    try:
        with engine.connect() as conn:
            existing = conn.execute(
                text("SELECT id FROM complaints WHERE id=:id"), {"id": complaint_id}
            ).fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Complaint not found")
            conn.execute(text("DELETE FROM complaints WHERE id=:id"), {"id": complaint_id})
            conn.commit()
        return {"message": "Complaint deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting complaint: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")