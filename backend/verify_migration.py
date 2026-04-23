from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

engine = create_engine(db_url)
try:
    with engine.connect() as conn:
        print("Connected!")
        tables = conn.execute(text("SHOW TABLES")).fetchall()
        print(f"Tables: {[t[0] for t in tables]}")
        
        for table in ["students", "staff", "admins"]:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"{table} count: {count}")
except Exception as e:
    print(f"Error: {e}")
