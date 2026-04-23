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
        # Check if Mahesh exists and update his field_name to 'Electrical'
        res = conn.execute(text("UPDATE admins SET field_name = 'Electrical' WHERE name LIKE '%Mahesh%'")).rowcount
        conn.commit()
        print(f"UPDATED {res} rows for Mahesh to 'Electrical'")
        
        # Check current status
        res = conn.execute(text("SELECT id, name, email, field_name FROM admins")).fetchall()
        print("ALL ADMINS:")
        for r in res:
            print(r)
except Exception as e:
    print(f"ERROR: {e}")
