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
        with open("pwd_check.txt", "w") as f:
            for table in ["students", "staff", "admins"]:
                f.write(f"--- TABLE: {table} ---\n")
                res = conn.execute(text(f"SELECT email, password FROM {table}")).fetchall()
                for row in res:
                    pwd = row[1]
                    is_hashed = pwd.startswith("$2b$") or pwd.startswith("$2a$")
                    f.write(f"{row[0]}: Length={len(pwd)}, Hashed={is_hashed}, Prefix={pwd[:4]}\n")
                f.write("\n")
except Exception as e:
    with open("pwd_check.txt", "w") as f:
        f.write(f"ERROR: {e}")
