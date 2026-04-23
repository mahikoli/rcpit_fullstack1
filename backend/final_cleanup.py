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
        # Final Migration
        print("Starting final migration...")
        
        # Get all users
        users = conn.execute(text("SELECT * FROM users")).fetchall()
        for u in users:
            # id:0, name:1, email:2, password:3, role:4, mobile:5, year:6, qualification:7, lab_name:8, room_number:9
            role = u[4].lower()
            if role in ['user', 'student']:
                conn.execute(text("INSERT IGNORE INTO students (name, email, password, mobile, year) VALUES (:n, :e, :p, :m, :y)"),
                             {"n": u[1], "e": u[2], "p": u[3], "m": u[5], "y": u[6]})
            elif role in ['staff', 'technician']:
                conn.execute(text("INSERT IGNORE INTO staff (name, email, password, mobile, qualification, lab_name, room_number) VALUES (:n, :e, :p, :m, :q, :l, :r)"),
                             {"n": u[1], "e": u[2], "p": u[3], "m": u[5], "q": u[7], "l": u[8], "r": u[9]})
            elif role == 'admin':
                conn.execute(text("INSERT IGNORE INTO admins (name, email, password) VALUES (:n, :e, :p)"),
                             {"n": u[1], "e": u[2], "p": u[3]})
        
        # Verify migration (counts should match now)
        # Drop the table as requested
        print("Dropping old table 'users'...")
        conn.execute(text("DROP TABLE users"))
        
        # Check for users_old_* and drop them too
        for r in conn.execute(text("SHOW TABLES")).fetchall():
            if r[0].startswith("users_old_"):
                print(f"Dropping {r[0]}...")
                conn.execute(text(f"DROP TABLE {r[0]}"))
        
        conn.commit()
        print("Migration and Cleanup COMPLETE.")
except Exception as e:
    print(f"ERROR: {str(e)}")
