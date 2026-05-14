import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in .env file")

# PostgreSQL engine for Supabase
try:
    engine = create_engine(DATABASE_URL)
except Exception as e:
    print(f"Could not create database engine: {e}")
    raise


def init_db():
    try:
        with engine.connect() as conn:

            conn.execute(text("SELECT 1"))

            # Equipments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS equipments (
                    id SERIAL PRIMARY KEY,
                    unique_id VARCHAR(100) UNIQUE NOT NULL,
                    equipment_type VARCHAR(50),
                    lab_name VARCHAR(100),
                    room_name VARCHAR(100),
                    equipment_name VARCHAR(100)
                )
            """))

            # Issues table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS issues (
                    id SERIAL PRIMARY KEY,
                    equipment_type VARCHAR(50),
                    lab_name VARCHAR(100),
                    room_name VARCHAR(100),
                    equipment_name VARCHAR(100),
                    equipment_id VARCHAR(100),
                    description TEXT,
                    user_name VARCHAR(100),
                    email VARCHAR(100),
                    prn VARCHAR(100),
                    status VARCHAR(50) DEFAULT 'Pending',
                    priority VARCHAR(50) DEFAULT 'Medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    technician_id INTEGER NULL,
                    technician_name VARCHAR(100) NULL,
                    estimated_days VARCHAR(50) NULL,
                    technician_comment TEXT NULL,
                    issue_subtype VARCHAR(100) NULL,
                    user_confirmed BOOLEAN DEFAULT FALSE,
                    resolved_at TIMESTAMP NULL,
                    reporter_count INTEGER DEFAULT 1,
                    reporter_emails TEXT NULL,
                    student_dept VARCHAR(100) DEFAULT 'IT',
                    is_escalated BOOLEAN DEFAULT FALSE,
                    escalated_at TIMESTAMP NULL
                )
            """))

            # Students table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS students (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    mobile VARCHAR(15),
                    year VARCHAR(50),
                    department VARCHAR(100) DEFAULT 'IT'
                )
            """))

            # Staff table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS staff (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    mobile VARCHAR(15),
                    qualification VARCHAR(100),
                    lab_name VARCHAR(100),
                    room_number VARCHAR(100),
                    field_name VARCHAR(50) DEFAULT 'IT',
                    department VARCHAR(100) NULL
                )
            """))

            # Technicians table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS technicians (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    mobile VARCHAR(15),
                    department VARCHAR(50)
                )
            """))

            # Admins table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS admins (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100),
                    email VARCHAR(100) UNIQUE,
                    password VARCHAR(255),
                    field_name VARCHAR(50) DEFAULT 'IT',
                    admin_role VARCHAR(50) DEFAULT 'superadmin',
                    department VARCHAR(100) NULL,
                    mobile VARCHAR(20) NULL
                )
            """))

            # Notifications table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    target_role VARCHAR(50) NULL,
                    target_email VARCHAR(100) NULL,
                    message TEXT,
                    issue_id INTEGER,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # Notices table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notices (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255),
                    body TEXT,
                    posted_by VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # Complaints table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS complaints (
                    id SERIAL PRIMARY KEY,
                    student_name VARCHAR(100),
                    student_email VARCHAR(100),
                    department VARCHAR(100),
                    lab_assistant_name VARCHAR(100) NOT NULL,
                    lab_name VARCHAR(100),
                    description TEXT NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))

            # Indexes for Performance
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_issues_status ON issues (status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_issues_lab_name ON issues (lab_name)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues (created_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications (target_role)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_notifications_target_email ON notifications (target_email)"))

            conn.commit()

            print("PostgreSQL / Supabase database initialized successfully!")
            return True

    except Exception as e:
        print(f"Database connection failed: {e}")
        return False