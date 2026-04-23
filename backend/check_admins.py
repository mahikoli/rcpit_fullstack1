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
        res = conn.execute(text("SELECT id, name, email, field_name FROM admins")).fetchall()
        print("ADMINS:")
        for r in res:
            print(r)
except Exception as e:
    print(f"ERROR: {e}")
