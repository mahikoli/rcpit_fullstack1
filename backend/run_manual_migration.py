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
        print("Adding columns to issues table...")
        
        # Check current columns
        res = conn.execute(text("DESCRIBE issues")).fetchall()
        cols = [r[0] for r in res]
        print(f"Current cols: {cols}")
        
        if "estimated_days" not in cols:
            print("Adding estimated_days...")
            conn.execute(text("ALTER TABLE issues ADD COLUMN estimated_days VARCHAR(50) NULL"))
        
        if "technician_comment" not in cols:
            print("Adding technician_comment...")
            conn.execute(text("ALTER TABLE issues ADD COLUMN technician_comment TEXT NULL"))
            
        conn.commit()
    print("Migration successful")
except Exception as e:
    print(f"Migration ERROR: {e}")
