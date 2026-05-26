import React, { useState } from 'react';

const TaskForm = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState(3);
  const [dueDate, setDueDate] = useState('');

  // Inline error state
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    const impNum = Number(importance);
    if (isNaN(impNum) || impNum < 1 || impNum > 5 || !Number.isInteger(impNum)) {
      newErrors.importance = 'Importance must be an integer between 1 and 5';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(dueDate);
      if (selectedDate <= new Date()) {
        newErrors.dueDate = 'Due date must be set in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      importance: Number(importance),
      dueDate
    };

    const success = await onSubmit(taskData);
    if (success) {
      // Reset form fields
      setTitle('');
      setDescription('');
      setImportance(3);
      setDueDate('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay with blur */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3, 5, 12, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }} 
        onClick={onClose}
      ></div>

      {/* Slide-out Frosted Drawer Panel */}
      <div className="frosted-drawer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #FFF 40%, #C084FC 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Create Smart Task
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.15rem' }}>
              Server-side scoring active
            </p>
          </div>
          <button 
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#94A3B8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.25s ease'
            }} 
            onClick={onClose} 
            title="Close drawer"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFF';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', marginTop: '0.5rem' }} noValidate>
          
          {/* Title input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Task Title <span style={{ color: 'var(--importance-5)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implement OAuth Flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input-premium"
              style={{
                borderColor: errors.title ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.title ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.title && (
              <span style={{ color: 'var(--importance-5)', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                ⚠️ {errors.title}
              </span>
            )}
          </div>

          {/* Importance ratings dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Importance Level <span style={{ color: 'var(--importance-5)' }}>*</span>
            </label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="form-input-premium"
              style={{
                cursor: 'pointer',
                borderColor: errors.importance ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <option value="1">1 - Minor Impact (Daily tasks)</option>
              <option value="2">2 - Low Impact</option>
              <option value="3">3 - Medium Impact (Regular operations)</option>
              <option value="4">4 - High Impact</option>
              <option value="5">5 - Critical Impact (Triggers heavy score multipliers)</option>
            </select>
            {errors.importance && (
              <span style={{ color: 'var(--importance-5)', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                ⚠️ {errors.importance}
              </span>
            )}
          </div>

          {/* Date Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Due Date & Time <span style={{ color: 'var(--importance-5)' }}>*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-input-premium"
              style={{
                borderColor: errors.dueDate ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.dueDate ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.dueDate && (
              <span style={{ color: 'var(--importance-5)', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                ⚠️ {errors.dueDate}
              </span>
            )}
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Description Context
            </label>
            <textarea
              placeholder="Provide background context or task requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="form-input-premium"
              style={{
                resize: 'none',
                borderColor: errors.description ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.description ? '0 0 10px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.description && (
              <span style={{ color: 'var(--importance-5)', fontSize: '0.72rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                ⚠️ {errors.description}
              </span>
            )}
          </div>

          {/* Submit Action */}
          <button 
            type="submit" 
            className="btn-premium btn-premium-primary" 
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '0.92rem',
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem'
            }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Creating task...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create Smart Task
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default TaskForm;