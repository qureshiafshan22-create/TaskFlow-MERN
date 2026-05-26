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
      newErrors.title = 'Title is required';
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
        newErrors.dueDate = 'Due date must be a future date on creation';
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
      {/* Backdrop overlay */}
      <div style={styles.backdrop} onClick={onClose}></div>

      {/* Slide-out Drawer Panel */}
      <div style={styles.drawer}>
        <div style={styles.header}>
          <h2>Create Smart Task</h2>
          <button style={styles.closeBtn} onClick={onClose} title="Close drawer">✕</button>
        </div>

        <form onSubmit={handleFormSubmit} style={styles.form} noValidate>
          {/* Title input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Integrate Auth Service API"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                ...styles.input,
                borderColor: errors.title ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.title ? '0 0 8px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.title && (
              <span style={styles.errorText}>{errors.title}</span>
            )}
          </div>

          {/* Importance ratings */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Importance Rating *</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              style={{
                ...styles.select,
                borderColor: errors.importance ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)'
              }}
            >
              <option value="1">1 - Minor (Low priority impact)</option>
              <option value="2">2 - Low</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - High</option>
              <option value="5">5 - Critical (Triggers heavy scoring multiplier)</option>
            </select>
            {errors.importance && (
              <span style={styles.errorText}>{errors.importance}</span>
            )}
          </div>

          {/* Date Picker */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Due Date *</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                ...styles.input,
                borderColor: errors.dueDate ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.dueDate ? '0 0 8px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.dueDate && (
              <span style={styles.errorText}>{errors.dueDate}</span>
            )}
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Provide context or instructions for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                ...styles.textarea,
                borderColor: errors.description ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                boxShadow: errors.description ? '0 0 8px rgba(239, 68, 68, 0.15)' : 'none'
              }}
            />
            {errors.description && (
              <span style={styles.errorText}>{errors.description}</span>
            )}
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="primary" 
            disabled={isSubmitting}
            style={styles.submitBtn}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create Smart Task'
            )}
          </button>
        </form>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(5, 7, 12, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    animation: 'fadeIn 0.25s ease-out'
  },
  drawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '100%',
    maxWidth: '440px',
    height: '100vh',
    background: '#0B101D',
    borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
    padding: '2.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
    zIndex: 1001,
    overflowY: 'auto',
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '1.25rem',
    padding: '0.25rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    outline: 'none'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem'
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  input: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '0.8rem 0.95rem',
    color: '#FFF',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  select: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '0.8rem 0.95rem',
    color: '#FFF',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },
  textarea: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '0.8rem 0.95rem',
    color: '#FFF',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  errorText: {
    color: 'var(--importance-5)',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '0.15rem'
  },
  submitBtn: {
    width: '100%',
    padding: '0.85rem',
    fontSize: '0.95rem',
    marginTop: '0.5rem'
  }
};

export default TaskForm;
