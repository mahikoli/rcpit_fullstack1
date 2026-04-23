from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("Testing status update with feedback...")
        
        # 1. Ensure issue #1 exists (or any ID)
        issue = conn.execute(text("SELECT id, email, equipment_name FROM issues LIMIT 1")).fetchone()
        if not issue:
            print("No issues found to test")
            exit()
            
        issue_id, email, eq_name = issue
        print(f"Testing on issue ID: {issue_id} ({eq_name})")
        
        # 2. Try the UPDATE with feedback
        conn.execute(
            text("""
                UPDATE issues 
                SET status=:status, estimated_days=:days, technician_comment=:comment 
                WHERE id=:issue_id
            """),
            {
                "status": "In Progress", 
                "days": "1", 
                "comment": "Testing comment", 
                "issue_id": issue_id
            }
        )
        
        # 3. Try the Notification INSERT with emoji
        msg = f"Update on {eq_name}: Your request will take 1 days to resolve. \ud83d\udee0\ufe0f"
        conn.execute(
            text("INSERT INTO notifications (target_email, message, issue_id) VALUES (:email, :msg, :iid)"),
            {"email": email, "msg": msg, "iid": issue_id}
        )
        
        conn.commit()
    print("Test successful!")
except Exception as e:
    print(f"Test FAILED: {e}")
