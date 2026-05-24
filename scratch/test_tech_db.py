from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:mahiKOLI1137@db.mzelzxifyrtlosqyyclw.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("--- Technicians ---")
    techs = conn.execute(text("SELECT id, name, email FROM technicians")).fetchall()
    for t in techs:
        print(t)
