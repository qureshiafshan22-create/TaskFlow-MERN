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
    <div style={styles.appContainer}>
      {/* Toast Notification Banner */}
      {toast && (
        <div 
          style={{
            ...styles.toast,
            backgroundColor: toast.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
            boxShadow: toast.type === 'error' ? '0 10px 25px rgba(239, 68, 68, 0.25)' : '0 10px 25px rgba(16, 185, 129, 0.25)'
          }}
        >
          <span>{toast.type === 'error' ? '🚫' : '✨'}</span>
          <span style={{ fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1>TaskFlow</h1>
          <p style={styles.subtitle}>Smart Task Manager with Priority Scoring</p>
        </div>
        <button className="primary" onClick={() => setIsFormOpen(true)} style={styles.newTaskBtn}>
          <span style={{ fontSize: '1.25rem', marginRight: '0.2rem' }}>+</span>
          New Task
        </button>
      </header>

      {/* Analytics Dashboard */}
      <Dashboard stats={stats} loading={loading} />

      {/* Controls / Filtering section */}
      <div style={styles.controlsRow}>
        {/* Status filtering tabs */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Show Status:</span>
          {['all', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              style={{
                ...styles.filterBtn,
                backgroundColor: statusFilter === status ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                borderColor: statusFilter === status ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.06)',
                color: statusFilter === status ? '#FFF' : '#94A3B8',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Minimum Importance Slider */}
        <div style={styles.sliderGroup}>
          <span style={styles.filterLabel}>Min Importance: {minImportance}⭐</span>
          <input
            type="range"
            min="1"
            max="5"
            value={minImportance}
            onChange={(e) => handleMinImportanceChange(e.target.value)}
            style={styles.slider}
          />
        </div>
      </div>

      {/* Task Grid lists */}
      {error ? (
        <div style={styles.errorContainer}>
          <div style={{ fontSize: '3rem' }}>🔌</div>
          <h2>Server Connection Error</h2>
          <p style={{ color: '#94A3B8' }}>{error}</p>
          <button style={{ marginTop: '1rem' }} onClick={loadData}>Retry Connection</button>
        </div>
      ) : loading ? (
        <div style={styles.loadingContainer}>
          <div className="spinner" style={styles.mainSpinner}></div>
          <p style={{ color: '#94A3B8', fontWeight: '500' }}>Loading smart tasks and analytics...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ fontSize: '2.5rem' }}>✨</div>
          <h3>No tasks found</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            No tasks match the active filter criteria. Clear filters or create a new task to get started!
          </p>
        </div>
      ) : (
        <div style={styles.taskGrid}>
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

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    minHeight: '80vh'
  },
  toast: {
    position: 'fixed',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2000,
    padding: '0.95rem 1.6rem',
    borderRadius: '12px',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    animation: 'fadeIn 0.2s ease-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '1rem'
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '0.92rem',
    fontWeight: '500',
    marginTop: '0.2rem'
  },
  newTaskBtn: {
    padding: '0.75rem 1.45rem'
  },
  controlsRow: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    padding: '0.85rem 1.25rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginRight: '0.5rem'
  },
  filterBtn: {
    textTransform: 'capitalize',
    padding: '0.4rem 0.95rem',
    fontSize: '0.8rem',
    border: '1px solid transparent',
    borderRadius: '8px'
  },
  sliderGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  slider: {
    cursor: 'pointer',
    width: '120px',
    accentColor: 'var(--accent-purple)'
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: '1.25rem',
    alignItems: 'stretch'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '4.5rem 1rem',
    background: 'rgba(239, 68, 68, 0.01)',
    border: '1px dashed rgba(239, 68, 68, 0.18)',
    borderRadius: '16px',
    textAlign: 'center'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '6.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.005)',
    border: '1px dashed rgba(255, 255, 255, 0.04)',
    borderRadius: '16px'
  },
  mainSpinner: {
    width: '44px',
    height: '44px',
    borderWidth: '3.5px',
    borderTopColor: 'var(--accent-purple)'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '5rem 2rem',
    background: 'rgba(255, 255, 255, 0.005)',
    border: '2px dashed rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    textAlign: 'center',
    maxWidth: '450px',
    margin: '1.5rem auto'
  }
};

export default App;
