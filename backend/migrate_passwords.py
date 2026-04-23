import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import bcrypt

print("DEBUG: Script starting...")
load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

print(f"DEBUG: DATABASE_URL loaded: {'Yes' if db_url else 'No'}")

def migrate_table(conn, table_name):
    print(f"--- Migrating table: {table_name} ---")
    result = conn.execute(text(f"SELECT id, password, email FROM {table_name}"))
    users = result.fetchall()
    
    updated_count = 0
    for user_id, pwd, email in users:
        # Check if the password is already a valid bcrypt hash
        if not (pwd.startswith("$2b$") or pwd.startswith("$2a$")):
            print(f"Found plain-text password for user: {email}. Re-hashing...")
            
            # Hash the existing plain-text password
            hashed = bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            # Update the database
            conn.execute(
                text(f"UPDATE {table_name} SET password=:hashed WHERE id=:id"),
                {"hashed": hashed, "id": user_id}
            )
            updated_count += 1
            
    print(f"Completed {table_name}. Updated {updated_count} users.")
    return updated_count

try:
    if not db_url:
        raise ValueError("DATABASE_URL not found in .env")
        
    engine = create_engine(db_url)
    with engine.connect() as conn:
        total_updated = 0
        total_updated += migrate_table(conn, "admins")
        total_updated += migrate_table(conn, "staff")
        total_updated += migrate_table(conn, "students")
        
        if total_updated > 0:
            conn.commit()
            print(f"\n✅ SUCCESS: Successfully migrated {total_updated} passwords.")
        else:
            print("\n🙌 All passwords are already hashed. No action needed.")
            
except Exception as e:
    print(f"❌ ERROR: Migration failed: {e}")
