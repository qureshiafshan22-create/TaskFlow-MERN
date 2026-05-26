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

  // Custom golden gradient SVG stars
  const renderSVGStars = (lvl) => {
    return (
      <div style={{ display: 'inline-flex', gap: '0.15rem' }}>
        {[1, 2, 3, 4, 5].map((starIdx) => {
          const filled = starIdx <= lvl;
          return (
            <svg
              key={starIdx}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={filled ? "url(#goldGradient)" : "none"}
              stroke={filled ? "none" : "rgba(255, 255, 255, 0.25)"}
              strokeWidth="1.5"
              style={{
                filter: filled ? 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.45))' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          );
        })}
      </div>
    );
  };

  const getImportanceLabel = (lvl) => {
    const labels = {
      "5": 'Critical',
      "4": 'High',
      "3": 'Medium',
      "2": 'Low',
      "1": 'Minor'
    };
    return labels[String(lvl)] || 'Normal';
  };

  return (
    <div
      className={`glass-card task-card ${
        status === 'completed'
          ? ''
          : isOverdue
          ? 'task-card-overdue'
          : isHighPriority
          ? 'task-card-high-priority'
          : ''
      }`}
      style={{
        backgroundColor: status === 'completed' ? 'rgba(15, 23, 42, 0.15)' : 'var(--bg-card)',
        borderColor: status === 'completed'
          ? 'rgba(255, 255, 255, 0.02)'
          : isHighPriority
          ? (isOverdue ? 'rgba(239, 68, 68, 0.45)' : 'rgba(139, 92, 246, 0.45)')
          : 'rgba(255, 255, 255, 0.05)',
        opacity: status === 'completed' ? 0.65 : 1,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Top badges bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
        {/* Stars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          {renderSVGStars(importance)}
          <span style={{ fontSize: '0.62rem', fontWeight: '800', color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {getImportanceLabel(importance)} impact
          </span>
        </div>

        {/* Priority Score & High Priority tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {status === 'pending' && isHighPriority && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: '900',
              padding: '0.2rem 0.5rem',
              borderRadius: '8px',
              letterSpacing: '0.04em',
              background: isOverdue ? 'rgba(239, 68, 68, 0.12)' : 'rgba(139, 92, 246, 0.15)',
              color: isOverdue ? 'var(--importance-5)' : '#C084FC',
              border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              boxShadow: `0 0 10px ${isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.15)'}`
            }}>
              🚨 HIGH PRIORITY
            </span>
          )}
          <span 
            style={{
              fontSize: '0.72rem',
              color: '#CBD5E1',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              fontWeight: '600'
            }} 
            title="Priority score computed dynamically by server based on Importance and Days Until Due"
          >
            Score: <strong style={{ color: status === 'completed' ? '#64748B' : isHighPriority ? 'var(--accent-gold)' : '#FFF', fontSize: '0.75rem', fontWeight: '800' }}>{priorityScore.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Title & Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1, marginBottom: '1.25rem' }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '800',
          lineHeight: '1.3',
          textDecoration: status === 'completed' ? 'line-through' : 'none',
          color: status === 'completed' ? '#475569' : '#FFFFFF',
          letterSpacing: '-0.02em',
          wordBreak: 'break-word'
        }}>
          {title}
        </h3>
        {description ? (
          <p style={{
            fontSize: '0.85rem',
            lineHeight: '1.45',
            color: status === 'completed' ? '#334155' : '#94A3B8',
            wordBreak: 'break-word',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {description}
          </p>
        ) : (
          <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.15)' }}>No description provided</p>
        )}
      </div>

      {/* Due Date & Action controls footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Humanized Date Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={status === 'completed' ? '#475569' : isOverdue ? 'var(--importance-5)' : '#94A3B8'} strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span style={{ color: status === 'completed' ? '#475569' : '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due:</span>
          <span style={{
            color: status === 'completed' 
              ? '#475569' 
              : isOverdue 
              ? 'var(--importance-5)' 
              : 'var(--accent-cyan)',
            fontWeight: isOverdue && status === 'pending' ? '800' : '600',
            textTransform: 'lowercase',
            filter: isOverdue && status === 'pending' ? 'drop-shadow(0 0 4px rgba(239,68,68,0.25))' : 'none'
          }}>
            {formatHumanDate(dueDate)}
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          {status === 'pending' && (
            <button
              onClick={() => onToggleStatus(_id, 'completed')}
              className="btn-premium-complete"
              title="Mark task as complete"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Complete
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the task "${title}"?`)) {
                onDelete(_id);
              }
            }}
            className="btn-premium-delete"
            title="Delete task"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;