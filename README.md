# Employee & Task Dashboard

This is my submission for the Full Stack Development assignment (Track 3). It is a responsive web application that allows users to manage employees and assign tasks with status updates.

**Live Project:** [https://simple-dashboard-assignment.vercel.app/](https://simple-dashboard-assignment.vercel.app/)  
**API Documentation:** [https://my-api-backend-hbbv.onrender.com/docs](https://my-api-backend-hbbv.onrender.com/docs)

## Tech Stack

* **Frontend:** React (Vite), Bootstrap 5
* **Backend:** Python (FastAPI)
* **Database:** SQLite (Local) / Render Ephemeral (Production)
* **Deployment:** Vercel (Frontend) & Render (Backend)

## Features

* Full CRUD operations for Employees and Tasks.
* Task assignment logic (tasks are linked to specific employee IDs).
* Real-time status updates for tasks.
* Input validation to prevent empty fields.
* Fully deployed and accessible online.

## Setup Instructions

If you want to run the project locally, follow these steps:

**1. Backend**

Navigate to the backend folder and install dependencies:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

The API will run at http://127.0.0.1:8000.

2. Frontend

Navigate to the frontend folder:

cd frontend
npm install
npm run dev

The UI will run at http://localhost:5173

Notes
I completed the Full Stack track which covers both the frontend UI and backend API requirements. The backend uses FastAPI's automatic Swagger UI for documentation.


### **Push this change:**

`
```bash
git add README.md
git commit -m "Update project documentation"
git push`