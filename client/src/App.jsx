import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | completed

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) throw new Error('Health check response not OK');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'offline', database: 'unavailable', error: err.message });
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/tasks`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      setError(`Cannot connect to backend: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchTasks();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        setTasks([data.data, ...tasks]);
      } else {
        alert(data.error || 'Failed to add task');
      }
    } catch (err) {
      alert(`Error creating task: ${err.message}`);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t.id === task.id ? data.data : t)));
      }
    } catch (err) {
      alert(`Error updating task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="app-container">
      {/* Header & Badges */}
      <header className="app-header">
        <div className="header-brand">
          <div className="stack-icons">
            <span className="badge badge-pg">PostgreSQL</span>
            <span className="badge badge-exp">Express</span>
            <span className="badge badge-react">React</span>
            <span className="badge badge-node">Node.js</span>
          </div>
          <h1>PERN Stack Starter</h1>
          <p className="subtitle">
            Continuous Integration & Deployment powered by <strong>GitHub Actions</strong>
          </p>
        </div>

        {/* Live Service Status */}
        <div className="status-card">
          <div className="status-item">
            <span className="status-label">Backend API:</span>
            <span className={`status-pill ${health?.status === 'ok' ? 'online' : 'offline'}`}>
              {health?.status === 'ok' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">PostgreSQL:</span>
            <span
              className={`status-pill ${
                health?.database === 'connected' ? 'online' : 'offline'
              }`}
            >
              {health?.database || 'checking...'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">CI/CD:</span>
            <span className="status-pill github">GitHub Actions</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Create Task Form */}
        <section className="form-card">
          <h2>Create New Task</h2>
          <form onSubmit={handleAddTask} className="task-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Task title (e.g., Deploy to Production)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <textarea
                placeholder="Optional description / details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              + Add Task to PostgreSQL
            </button>
          </form>
        </section>

        {/* Error notification if backend isn't reachable */}
        {error && (
          <div className="error-alert">
            <div className="error-title">⚠️ Connection Issue</div>
            <p>{error}</p>
            <small>Make sure the backend is running (`npm start` in server/ or `docker-compose up`).</small>
          </div>
        )}

        {/* Task List Section */}
        <section className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks ({filteredTasks.length})</h2>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({tasks.length})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({tasks.filter((t) => !t.completed).length})
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed ({tasks.filter((t) => t.completed).length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading tasks from database...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found in this view.</p>
              <span>Add your first task above!</span>
            </div>
          ) : (
            <div className="task-grid">
              {filteredTasks.map((task) => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <div className="task-header-row">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        className="task-checkbox"
                        title="Mark complete / incomplete"
                      />
                      <h3 className="task-title">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="btn-delete"
                      title="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>PERN Stack Application • CI/CD Deployment with GitHub Actions</p>
      </footer>
    </div>
  );
}
