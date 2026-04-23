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
        with open("schema_res.txt", "w") as f:
            for table in ["students", "staff", "admins"]:
                f.write(f"--- TABLE: {table} ---\n")
                res = conn.execute(text(f"DESCRIBE {table}")).fetchall()
                for row in res:
                    f.write(f"{row[0]}: {row[1]}\n")
                f.write("\n")
except Exception as e:
    with open("schema_res.txt", "w") as f:
        f.write(f"ERROR: {e}")
