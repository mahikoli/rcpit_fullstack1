from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

print(f"URL: {db_url}")

try:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        res = conn.execute(text("DESCRIBE issues")).fetchall()
        cols = [r[0] for r in res]
        print(f"COLS: {cols}")
except Exception as e:
    print(f"ERROR: {e}")
