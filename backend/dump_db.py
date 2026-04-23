from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
import json

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

try:
    engine = create_engine(db_url)
    data = {}
    with engine.connect() as conn:
        res_admins = conn.execute(text("SELECT id, name, email, field_name FROM admins")).fetchall()
        data["admins"] = [dict(zip(["id", "name", "email", "field_name"], r)) for r in res_admins]
        
        res_dirs = conn.execute(text("SELECT id, name, email FROM directors")).fetchall()
        data["directors"] = [dict(zip(["id", "name", "email"], r)) for r in res_dirs]
        
    with open("backend/db_dump.json", "w") as f:
        json.dump(data, f, indent=4)
except Exception as e:
    with open("backend/db_dump.json", "w") as f:
        json.dump({"error": str(e)}, f)
