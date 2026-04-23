from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

print(f"Connecting to: {db_url}")
try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("\n--- ADMINS TABLE ---")
        admins = conn.execute(text("SELECT id, name, email, field_name FROM admins")).fetchall()
        for a in admins:
            print(a)
            
        print("\n--- EQUIPMENT TYPES ---")
        types = conn.execute(text("SELECT DISTINCT equipment_type FROM issues")).fetchall()
        for t in types:
            print(t)
            
        # Ensure 'Mahesh' is 'Electrical'
        count = conn.execute(text("UPDATE admins SET field_name = 'Electrical' WHERE name LIKE '%Mahesh%'")).rowcount
        conn.commit()
        print(f"\nUpdated {count} admins with 'Mahesh' in name to 'Electrical'")
        
except Exception as e:
    print(f"ERROR: {e}")
