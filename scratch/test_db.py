import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:mahiKOLI1137@db.mzelzxifyrtlosqyyclw.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Students ---")
    students = conn.execute(text("SELECT id, name, email FROM students")).fetchall()
    for s in students:
        print(s)

    print("\n--- Staff ---")
    staff = conn.execute(text("SELECT id, name, email FROM staff")).fetchall()
    for st in staff:
        print(st)

    print("\n--- Admins ---")
    admins = conn.execute(text("SELECT id, name, email, admin_role FROM admins")).fetchall()
    for a in admins:
        print(a)
