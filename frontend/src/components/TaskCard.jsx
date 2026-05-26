import React from 'react';

const formatHumanDate = (dateStr) => {
  const now = new Date();
  const dueDate = new Date(dateStr);
  const diffTime = dueDate.getTime() - now.getTime();
  
  // Calculate difference in days, rounded down
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'due today';
  } else if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return `overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
  } else {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
};

const TaskCard = ({ task, onToggleStatus, onDelete }) => {
  const { _id, title, description, importance, dueDate, status, priorityScore } = task;

  const isOverdue = status === 'pending' && new Date(dueDate) < new Date();
  const isHighPriority = priorityScore >= 50;

  const renderStars = (lvl) => {
    return '★'.repeat(lvl) + '☆'.repeat(5 - lvl);
  };

  const getImportanceColor = (lvl) => {
    const colors = {
      "5": 'var(--importance-5)',
      "4": 'var(--importance-4)',
      "3": 'var(--importance-3)',
      "2": 'var(--importance-2)',
      "1": 'var(--importance-1)'
    };
    return colors[String(lvl)] || '#CBD5E1';
  };

  return (
    <div style={{
      ...styles.card,
      borderColor: isHighPriority 
        ? (isOverdue ? 'rgba(239, 68, 68, 0.45)' : 'rgba(139, 92, 246, 0.45)') 
        : 'rgba(255, 255, 255, 0.05)',
      boxShadow: isHighPriority 
        ? (isOverdue ? '0 0 15px rgba(239, 68, 68, 0.08)' : '0 0 15px rgba(139, 92, 246, 0.08)') 
        : 'none',
      backgroundColor: status === 'completed' ? 'rgba(22, 28, 45, 0.25)' : 'var(--bg-card)'
    }}>
      {/* Top badges bar */}
      <div style={styles.badgeBar}>
        {/* Stars */}
        <span 
          style={{ ...styles.starsBadge, color: getImportanceColor(importance) }}
          title={`Importance Level ${importance}/5`}
        >
          {renderStars(importance)}
        </span>

        {/* Priority Score & High Priority tag */}
        <div style={styles.scoreRow}>
          {isHighPriority && (
            <span style={{
              ...styles.highlightTag,
              backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
              color: isOverdue ? 'var(--importance-5)' : 'var(--accent-purple)',
              borderColor: isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'rgba(139, 92, 246, 0.25)'
            }}>
              🚨 HIGH PRIORITY
            </span>
          )}
          <span style={styles.scoreBadge} title="Priority score computed dynamically by server">
            Score: <strong style={{ color: isHighPriority ? 'var(--importance-4)' : '#FFF' }}>{priorityScore.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div style={styles.contentSection}>
        <h3 style={{
          ...styles.title,
          textDecoration: status === 'completed' ? 'line-through' : 'none',
          color: status === 'completed' ? '#64748B' : '#FFF'
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            ...styles.description,
            color: status === 'completed' ? '#475569' : '#94A3B8'
          }}>
            {description}
          </p>
        )}
      </div>

      {/* Due Date & Action controls footer */}
      <div style={styles.footer}>
        {/* Humanized Date Indicator */}
        <div style={styles.dateSection}>
          <span style={styles.dateLabel}>Due:</span>
          <span style={{
            ...styles.dateValue,
            color: isOverdue ? 'var(--importance-5)' : (status === 'completed' ? '#64748B' : '#CBD5E1'),
            fontWeight: isOverdue ? '700' : '500'
          }}>
            {formatHumanDate(dueDate)}
          </span>
        </div>

        {/* Action Controls */}
        <div style={styles.actionButtons}>
          {status === 'pending' && (
            <button
              onClick={() => onToggleStatus(_id, 'completed')}
              style={styles.completeBtn}
              title="Mark task as complete"
            >
              ✓ Complete
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the task "${title}"?`)) {
                onDelete(_id);
              }
            }}
            style={styles.deleteBtn}
            title="Delete task"
          >
            ✕ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid transparent',
    borderRadius: '12px',
    padding: '1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    transition: 'all 0.25s ease',
    position: 'relative'
  },
  badgeBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  starsBadge: {
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    fontWeight: '800'
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  highlightTag: {
    fontSize: '0.62rem',
    fontWeight: '800',
    padding: '0.15rem 0.45rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    letterSpacing: '0.04em'
  },
  scoreBadge: {
    fontSize: '0.7rem',
    color: '#94A3B8',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.03)'
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '700',
    lineHeight: '1.3'
  },
  description: {
    fontSize: '0.82rem',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '0.75rem',
    marginTop: '0.15rem',
    flexWrap: 'wrap',
    gap: '0.75rem'
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    fontSize: '0.75rem'
  },
  dateLabel: {
    color: '#64748B',
    fontWeight: '600'
  },
  dateValue: {
    textTransform: 'lowercase'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.4rem'
  },
  completeBtn: {
    fontSize: '0.72rem',
    padding: '0.35rem 0.7rem',
    color: '#06B6D4',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.25)',
    borderRadius: '8px',
    height: '28px'
  },
  deleteBtn: {
    fontSize: '0.72rem',
    padding: '0.35rem 0.7rem',
    color: '#64748B',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
    height: '28px'
  }
};

export default TaskCard;
