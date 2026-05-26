import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/bfhl';

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    averageImportance: 0.00,
    overdueTasks: 0,
    tasksByImportance: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drawer Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [minImportance, setMinImportance] = useState(1);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(current => {
        if (current && current.message === message) return null;
        return current;
      });
    }, 4000);
  };

  // Fetch Tasks with filters
  const fetchTasks = async (status = statusFilter, minImp = minImportance) => {
    try {
      let url = `${API_BASE_URL}/tasks`;
      const queryParams = [];

      if (status !== 'all') {
        queryParams.push(`status=${status}`);
      }
      if (minImp > 1) {
        queryParams.push(`minImportance=${minImp}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to retrieve tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve tasks. Please ensure the backend server is active.');
    }
  };

  // Fetch stats from aggregation endpoint
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/stats`);
      if (!res.ok) throw new Error('Failed to retrieve metrics');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchTasks(), fetchStats()]);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadData();

    // Auto-refresh scores and times every 30 seconds
    const interval = setInterval(() => {
      fetchTasks();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter handlers
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchTasks(status, minImportance);
  };

  const handleMinImportanceChange = (val) => {
    const minImp = Number(val);
    setMinImportance(minImp);
    fetchTasks(statusFilter, minImp);
  };

  // Form Submit Handler
  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create task');
      }

      showToast('Smart task created successfully!', 'success');
      await Promise.all([fetchTasks(), fetchStats()]);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Completed Status Handler
  const handleToggleStatus = async (id, targetStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update task');
      }

      showToast('Task marked as completed!', 'success');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Task Handler
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete task');
      }

      showToast('Task deleted successfully.', 'success');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem', minHeight: '80vh', position: 'relative' }}>
      
      {/* Toast Notification Capsule */}
      {toast && (
        <div className={`toast-capsule ${toast.type === 'error' ? 'toast-capsule-error' : 'toast-capsule-success'}`}>
          <span style={{ fontSize: '1rem', display: 'inline-flex' }}>
            {toast.type === 'error' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--importance-5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </span>
          <span style={{ fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.01em' }}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="logo-container">
          <h1>TaskFlow</h1>
          <div className="subtitle">
            Smart Task Manager
            <span className="subtitle-badge">Priority Scoring V1</span>
          </div>
        </div>
        <button className="btn-premium btn-premium-primary" onClick={() => setIsFormOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Task
        </button>
      </header>

      {/* Analytics Dashboard */}
      <Dashboard stats={stats} loading={loading} />

      {/* Controls / Filtering section */}
      <div className="controls-panel">
        {/* Status filtering tabs */}
        <div className="filter-btn-group">
          <span className="filter-label" style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '0.5rem' }}>Show Status:</span>
          {['all', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`filter-btn ${statusFilter === status ? 'filter-btn-active' : ''}`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Minimum Importance Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span className="filter-label" style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Min Importance: <strong style={{ color: '#CBD5E1', marginLeft: '0.15rem' }}>{minImportance}⭐</strong>
          </span>
          <input
            type="range"
            min="1"
            max="5"
            value={minImportance}
            onChange={(e) => handleMinImportanceChange(e.target.value)}
            className="custom-slider"
          />
        </div>
      </div>

      {/* Task Grid lists */}
      {error ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', padding: '5rem 2rem', border: '1px dashed rgba(239, 68, 68, 0.25)', textAlign: 'center', background: 'rgba(239, 68, 68, 0.02)' }}>
          <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.4))' }}>🔌</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Server Connection Offline</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', maxWidth: '400px', lineHeight: '1.5' }}>{error}</p>
          <button className="btn-premium btn-premium-secondary" style={{ marginTop: '0.5rem' }} onClick={loadData}>
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="tasks-layout-grid">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="glass-card shimmer-bg" style={{ height: '220px', border: '1px solid rgba(255,255,255,0.03)' }}></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.85rem', padding: '5.5rem 2rem', border: '2px dashed rgba(255, 255, 255, 0.03)', textAlign: 'center', maxWidth: '450px', margin: '2rem auto', background: 'transparent' }}>
          <div style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>✨</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>No Tasks Active</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: '1.4' }}>
            No tasks match the active filters or slider specifications. Try broadening your criteria or initialize a new record.
          </p>
        </div>
      ) : (
        <div className="tasks-layout-grid">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Task Creation Modal Drawer */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;