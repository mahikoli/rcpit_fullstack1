🎓 RCPIT Fullstack Project
A fullstack web application built with React (Frontend) and FastAPI (Backend), developed as part of the coursework at R.C. Patel Institute of Technology (RCPIT), Shirpur.

🛠️ Tech Stack
LayerTechnologyFrontendReact.jsBackendFastAPI (Python)StylingCSS / Tailwind CSSAPIREST API

📁 Project Structure
rcpit_fullstack/
<<<<<<< HEAD
├── maintainance/          # React application
=======
├── frontend/          # React application
>>>>>>> e9d82e55fbec5dda81fa44c83a01b3b929547670
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/           # FastAPI application
│   ├── main.py
│   ├── routes/
│   ├── models/
│   ├── schemas/
│   └── requirements.txt
│
└── README.md

🚀 Getting Started
Prerequisites
Make sure you have the following installed:

Node.js (v18+)
Python (v3.9+)
pip


🖥️ Frontend Setup (React)
bash# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The React app will run at http://localhost:5173

⚙️ Backend Setup (FastAPI)
bash# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
The FastAPI server will run at http://localhost:8000

📄 API docs available at: http://localhost:8000/docs (Swagger UI)


🌐 Environment Variables
Create a .env file in the backend/ directory:
env# Example
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
Create a .env file in the frontend/ directory:
envVITE_API_URL=http://localhost:8000

📸 Screenshots

Add screenshots of your project here


👨‍💻 Author
Mahikoli — Student at R.C. Patel Institute of Technology, Shirpur

📄 License
This project is for academic/educational purposes only.
