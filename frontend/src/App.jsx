import { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import Filter from "./components/Filter";
import { fetchTasks, createTask, updateTask, deleteTask } from "./services/api";

const initialFilter = { status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" };

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks(filter);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const handleCreate = async (taskData) => {
    try {
      setError(null);
      const newTask = await createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (id, taskData) => {
    try {
      setError(null);
      const updatedTask = await updateTask(id, taskData);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      setEditingTask(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      setError(null);
      await deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <div className="task-summary">
          <span>Total: {tasks.length}</span>
          <span className="status-todo">Todo: {statusCounts.todo || 0}</span>
          <span className="status-in-progress">In Progress: {statusCounts["in-progress"] || 0}</span>
          <span className="status-done">Done: {statusCounts.done || 0}</span>
        </div>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button onClick={() => setError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}

      <main className="app-main">
        <aside className="sidebar">
          <Filter filter={filter} onFilterChange={setFilter} />
          
          <div className="sidebar-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => { setEditingTask(null); setShowForm(true); }}
            >
              + Add Task
            </button>
          </div>
        </aside>

        <section className="task-list-container">
          {showForm && (
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdate : handleCreate}
              onCancel={handleCancel}
            />
          )}
          
          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
}

export default App;