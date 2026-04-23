from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        # Simulate reporting issue for AIML
        print("Simulating AIML issue report...")
        conn.execute(text("""
            INSERT INTO issues (equipment_type, lab_name, room_name, equipment_name, equipment_id, description, user_name, email, prn, status, technician_id, technician_name)
            VALUES ('PC', 'AIML', 'Room 101', 'PC-01', 'AIML-01', 'Blue screen', 'Test Student', 'test@student.com', '12345', 'Pending', NULL, NULL)
        """))
        # Wait, the trigger is in the API, not the DB. 
        # I should use the API logic but since I'm just verifying THE CODE I wrote in main.py, 
        # I'll manually run a "trigger-like" block or just call the create_issue function manually in a script.
        
        # Actually, I'll just write a script that CALLS the create_issue logic as defined in main.py.
        from main import create_issue, IssueCreate
        from pydantic import ValidationError
        
        try:
            # Case 1: AIML (Should be auto-assigned)
            data_aiml = IssueCreate(
                equipment_type="PC", lab_name="AIML", room_name="Room 101",
                equipment_name="PC-01", equipment_id="AIML-01", description="Blue screen",
                user_name="Test Student", email="test@student.com", prn="12345"
            )
            create_issue(data_aiml)
            print("Reported AIML issue.")
            
            # Case 2: IOT (Should be Pending)
            data_iot = IssueCreate(
                equipment_type="PC", lab_name="IOT", room_name="Room 202",
                equipment_name="PC-02", equipment_id="IOT-01", description="Not turning on",
                user_name="Test Student", email="test@student.com", prn="12345"
            )
            create_issue(data_iot)
            print("Reported IOT issue.")
            
            # Verify in DB
            res = conn.execute(text("SELECT id, lab_name, status, technician_name FROM issues ORDER BY id DESC LIMIT 2")).fetchall()
            with open("test_results.txt", "w") as f:
                f.write(str([dict(r._mapping) for r in res]))
                
        except Exception as e:
            with open("test_results.txt", "w") as f:
                f.write(f"ERROR: {e}")
                
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
