from pydantic import BaseModel
from typing import Optional

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
