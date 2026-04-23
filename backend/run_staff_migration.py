from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Running migrations for staff table...")
    try:
        conn.execute(text("ALTER TABLE staff ADD COLUMN field_name VARCHAR(50) DEFAULT 'IT'"))
        print("Added field_name")
    except Exception as e:
        print(f"field_name: {e}")
    try:
        conn.execute(text("ALTER TABLE staff ADD COLUMN department VARCHAR(100) NULL"))
        print("Added department")
    except Exception as e:
        print(f"department: {e}")
    conn.commit()

    print("\nStaff table columns:")
    result = conn.execute(text("DESCRIBE staff"))
    for row in result:
        print(row)
