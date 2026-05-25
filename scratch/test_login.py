import bcrypt
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:mahiKOLI1137@db.mzelzxifyrtlosqyyclw.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

email = "pramod1234@gmail.com"

with engine.connect() as conn:
    query = text("""
        SELECT id, name, email, password, field_name, admin_role, department, mobile, 'admin' as origin, NULL as qualification, NULL as lab_name, NULL as room_number, NULL as year FROM admins WHERE email = :email
        UNION ALL
        SELECT id, name, email, password, field_name, 'staff' as admin_role, department, mobile, 'staff' as origin, qualification, lab_name, room_number, NULL as year FROM staff WHERE email = :email
        UNION ALL
        SELECT id, name, email, password, NULL as field_name, 'user' as admin_role, department, mobile, 'students' as origin, NULL as qualification, NULL as lab_name, NULL as room_number, year FROM students WHERE email = :email
        LIMIT 1
    """)
    user_row = conn.execute(query, {"email": email}).fetchone()
    print("User Row:", user_row)
    if user_row:
        user_id, name, email_db, stored_password, field_name, admin_role_db, department, mobile, origin, qualification, lab_name, room_number, year = user_row
        print("Origin:", origin)
        print("Admin Role DB:", admin_role_db)
        
        # Determine frontend role
        if origin == "admin":
            role = "admin"
            admin_role = admin_role_db
        elif origin == "staff":
            role = "staff"
            admin_role = "staff"
        else:
            role = "User"
            admin_role = "user"
            
        print("Role determined:", role)
        print("Admin Role determined:", admin_role)
