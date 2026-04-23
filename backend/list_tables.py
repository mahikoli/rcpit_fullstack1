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
        result = conn.execute(text("SHOW TABLES")).fetchall()
        tables = [r[0] for r in result]
        print("TABLES_FOUND:" + ",".join(tables))
except Exception as e:
    print(f"ERROR_DURING_CHECK:{e}")
