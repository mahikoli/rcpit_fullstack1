from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

with open("final_result.txt", "w") as f:
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            # Check if users still exists
            tables = [r[0] for r in conn.execute(text("SHOW TABLES")).fetchall()]
            f.write(f"Final Tables: {','.join(tables)}\n")
            
            if 'users' in tables:
                f.write("WARNING: 'users' table STILL EXISTS.\n")
                try:
                    conn.execute(text("DROP TABLE users"))
                    conn.commit()
                    f.write("Successfully dropped 'users' on second attempt.\n")
                except Exception as e:
                    f.write(f"FAILED to drop 'users': {str(e)}\n")
            else:
                f.write("'users' table is GONE.\n")
                
            # Final table list after second attempt
            tables_after = [r[0] for r in conn.execute(text("SHOW TABLES")).fetchall()]
            f.write(f"Final Final Tables: {','.join(tables_after)}\n")

    except Exception as e:
        f.write(f"CRITICAL ERROR: {str(e)}")
