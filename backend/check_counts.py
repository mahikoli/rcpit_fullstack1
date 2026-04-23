from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

with open("counts.txt", "w") as f:
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            user_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
            student_count = conn.execute(text("SELECT COUNT(*) FROM students")).scalar()
            f.write(f"Users: {user_count}\n")
            f.write(f"Students: {student_count}\n")
            
            # Check unique emails in both
            u_emails = {r[0] for r in conn.execute(text("SELECT email FROM users WHERE role='User'")).fetchall()}
            s_emails = {r[0] for r in conn.execute(text("SELECT email FROM students")).fetchall()}
            f.write(f"User Student Emails: {len(u_emails)}\n")
            f.write(f"New Student Emails: {len(s_emails)}\n")
            f.write(f"Missing in Students: {len(u_emails - s_emails)}\n")
    except Exception as e:
        f.write(f"ERROR: {str(e)}")
