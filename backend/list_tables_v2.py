from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

with open("result.txt", "w") as f:
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SHOW TABLES")).fetchall()
            tables = [r[0] for r in result]
            f.write(",".join(tables))
    except Exception as e:
        f.write(f"ERROR: {str(e)}")
