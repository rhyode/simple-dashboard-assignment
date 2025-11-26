import { useState, useEffect } from 'react'
import axios from 'axios'

// API Base URL
const API_URL = "https://my-api-backend-hbbv.onrender.com"

function App() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  
  // Form States
  const [empName, setEmpName] = useState("")
  const [empEmail, setEmpEmail] = useState("")
  const [empRole, setEmpRole] = useState("")
  
  const [taskTitle, setTaskTitle] = useState("")
  const [taskOwnerId, setTaskOwnerId] = useState("")

  // Load data on startup
  useEffect(() => {
    fetchEmployees()
    fetchTasks()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_URL}/employees/`)
      setEmployees(response.data)
    } catch (error) { console.error("Error fetching employees", error) }
  }

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/`)
      setTasks(response.data)
    } catch (error) { console.error("Error fetching tasks", error) }
  }

  // --- Handlers ---
  const handleAddEmployee = async (e) => {
    e.preventDefault()
    if (!empName || !empEmail || !empRole) return alert("Fill all fields")
    try {
      await axios.post(`${API_URL}/employees/`, { name: empName, email: empEmail, role: empRole })
      setEmpName(""); setEmpEmail(""); setEmpRole("")
      fetchEmployees()
    } catch (error) { alert("Error adding employee (maybe email exists?)") }
  }

  const handleDeleteEmployee = async (id) => {
    if(!confirm("Delete this employee?")) return
    try {
      await axios.delete(`${API_URL}/employees/${id}`)
      fetchEmployees()
      fetchTasks() // Refresh tasks too as they might be cascade deleted
    } catch (error) { console.error("Error deleting", error) }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!taskTitle || !taskOwnerId) return alert("Fill all fields")
    try {
      await axios.post(`${API_URL}/tasks/`, { title: taskTitle, owner_id: parseInt(taskOwnerId) })
      setTaskTitle(""); setTaskOwnerId("")
      fetchTasks()
    } catch (error) { alert("Error adding task (Check Employee ID)") }
  }

  const handleUpdateTask = async (id, status) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}?status=${status}`)
      fetchTasks()
    } catch (error) { console.error("Error updating task", error) }
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Employee & Task Dashboard</h1>
      
      <div className="row">
        {/* --- Left Column: Employees --- */}
        <div className="col-md-6">
          <div className="card shadow p-3 mb-4">
            <h3>👥 Employees</h3>
            <form onSubmit={handleAddEmployee} className="mb-3">
              <div className="input-group mb-2">
                <input className="form-control" placeholder="Name" value={empName} onChange={e => setEmpName(e.target.value)} />
                <input className="form-control" placeholder="Role" value={empRole} onChange={e => setEmpRole(e.target.value)} />
              </div>
              <div className="input-group">
                <input className="form-control" placeholder="Email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} />
                <button className="btn btn-primary" type="submit">Add</button>
              </div>
            </form>

            <ul className="list-group">
              {employees.map(emp => (
                <li key={emp.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{emp.name}</strong> ({emp.role}) <br/>
                    <small className="text-muted">ID: {emp.id} | {emp.email}</small>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteEmployee(emp.id)}>X</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- Right Column: Tasks --- */}
        <div className="col-md-6">
          <div className="card shadow p-3">
            <h3>📝 Tasks</h3>
            <form onSubmit={handleAddTask} className="mb-3">
              <div className="input-group">
                <input className="form-control" placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                <select className="form-select" value={taskOwnerId} onChange={e => setTaskOwnerId(e.target.value)}>
                  <option value="">Assign to...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.id})</option>)}
                </select>
                <button className="btn btn-success" type="submit">Add</button>
              </div>
            </form>

            <table className="table table-bordered">
              <thead><tr><th>Task</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>ID: {task.owner_id}</td>
                    <td>
                      <select 
                        value={task.status} 
                        onChange={(e) => handleUpdateTask(task.id, e.target.value)}
                        className={`form-select form-select-sm ${task.status === 'Completed' ? 'bg-success text-white' : ''}`}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App