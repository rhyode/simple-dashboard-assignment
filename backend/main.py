from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from typing import List, Optional

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
# check_same_thread=False is needed for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models (Tables) ---
class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    tasks = relationship("Task", back_populates="owner", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    status = Column(String, default="Pending") # Pending, In Progress, Completed
    owner_id = Column(Integer, ForeignKey("employees.id"))
    owner = relationship("Employee", back_populates="tasks")

# Create Tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (Data Validation) ---
class TaskBase(BaseModel):
    title: str
    status: str = "Pending"
    owner_id: int

class TaskResponse(TaskBase):
    id: int
    class Config:
        orm_mode = True

class EmployeeBase(BaseModel):
    name: str
    email: str
    role: str

class EmployeeResponse(EmployeeBase):
    id: int
    tasks: List[TaskResponse] = []
    class Config:
        orm_mode = True

# --- App Setup ---
app = FastAPI()

# Allow React (localhost:5173 is Vite default) to hit the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins (easiest for dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints: Employees ---
@app.post("/employees/", response_model=EmployeeResponse)
def create_employee(employee: EmployeeBase, db: Session = Depends(get_db)):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/employees/", response_model=List[EmployeeResponse])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return {"detail": "Employee deleted"}

# --- Endpoints: Tasks ---
@app.post("/tasks/", response_model=TaskResponse)
def create_task(task: TaskBase, db: Session = Depends(get_db)):
    # Verify employee exists first
    employee = db.query(Employee).filter(Employee.id == task.owner_id).first()
    if not employee:
         raise HTTPException(status_code=404, detail="Employee not found")
    
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[TaskResponse])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@app.put("/tasks/{task_id}")
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    db.commit()
    return {"message": "Task updated"}