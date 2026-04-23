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
        print("--- DATABASE CONNECTION SUCCESS ---")
        
        # Check Admins
        res_admins = conn.execute(text("SELECT id, name, email, field_name FROM admins")).fetchall()
        print(f"ADMINS COUNT: {len(res_admins)}")
        for r in res_admins:
            print(f"  - {r}")
        
        # Check Directors
        res_dirs = conn.execute(text("SELECT id, name, email FROM directors")).fetchall()
        print(f"DIRECTORS COUNT: {len(res_dirs)}")
        for r in res_dirs:
            print(f"  - {r}")
            
        print("--- END OF DATA ---")
except Exception as e:
    print(f"ERROR: {e}")
