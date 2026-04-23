from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

engine = create_engine(DATABASE_URL)

email = "durgesh1137@gmail.com" # From the error log

with engine.connect() as conn:
    print(f"Testing login query for {email}...")
    res = conn.execute(text("SELECT id, name, email, password, field_name, department, mobile FROM staff WHERE email=:email"), {"email": email}).fetchone()
    if res:
        print("Success! Found user:")
        print(f"ID: {res[0]}")
        print(f"Name: {res[1]}")
        print(f"Field: {res[4]}")
        print(f"Dept: {res[5]}")
        print(f"Mobile: {res[6]}")
    else:
        print("User not found in staff table.")
