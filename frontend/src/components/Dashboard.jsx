import React from 'react';

const Dashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.skeleton}></div>
      </div>
    );
  }

  const {
    totalTasks = 0,
    pendingTasks = 0,
    completedTasks = 0,
    averageImportance = 0.00,
    overdueTasks = 0,
    tasksByImportance = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
  } = stats || {};

  return (
    <div style={styles.container}>
      {/* Total Tasks Card */}
      <div style={styles.statCard}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Total Tasks</span>
          <span style={styles.icon}>📋</span>
        </div>
        <div style={styles.value}>{totalTasks}</div>
      </div>

      {/* Pending Card */}
      <div style={styles.statCard}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Pending</span>
          <span style={{ ...styles.badge, backgroundColor: 'var(--accent-blue)' }}></span>
        </div>
        <div style={styles.value}>{pendingTasks}</div>
      </div>

      {/* Completed Card */}
      <div style={styles.statCard}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Completed</span>
          <span style={{ ...styles.badge, backgroundColor: 'var(--importance-2)' }}></span>
        </div>
        <div style={styles.value}>{completedTasks}</div>
      </div>

      {/* Overdue Tasks Card */}
      <div style={{
        ...styles.statCard,
        ...(overdueTasks > 0 ? styles.overdueCardActive : {})
      }}>
        <div style={styles.cardHeader}>
          <span style={{
            ...styles.cardTitle,
            ...(overdueTasks > 0 ? { color: 'var(--importance-5)' } : {})
          }}>Overdue</span>
          {overdueTasks > 0 ? (
            <span className="pulse-glow-red" style={styles.warningTag}>⚠️</span>
          ) : (
            <span style={{ ...styles.badge, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></span>
          )}
        </div>
        <div style={{
          ...styles.value,
          ...(overdueTasks > 0 ? { color: 'var(--importance-5)' } : {})
        }}>{overdueTasks}</div>
      </div>

      {/* Importance Distribution Card */}
      <div style={{ ...styles.statCard, ...styles.distributionCard }}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Importance Distribution</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
            Avg: {averageImportance}⭐
          </span>
        </div>
        <div style={styles.barsContainer}>
          {[5, 4, 3, 2, 1].map(lvl => {
            const count = tasksByImportance[String(lvl)] || 0;
            const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            const barColors = {
              "5": 'var(--importance-5)',
              "4": 'var(--importance-4)',
              "3": 'var(--importance-3)',
              "2": 'var(--importance-2)',
              "1": 'var(--importance-1)'
            };

            return (
              <div key={lvl} style={styles.distributionRow} title={`${count} tasks at Importance ${lvl}`}>
                <span style={styles.lvlLabel}>{lvl}★</span>
                <div style={styles.barTrack}>
                  <div style={{
                    ...styles.barFill,
                    width: `${percentage}%`,
                    backgroundColor: barColors[String(lvl)]
                  }}></div>
                </div>
                <span style={styles.lvlCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '1rem',
    width: '100%'
  },
  skeleton: {
    height: '110px',
    borderRadius: '14px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    gridColumn: '1 / -1'
  },
  statCard: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    border: '1px solid var(--border-glow)',
    borderRadius: '14px',
    padding: '1.15rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    transition: 'transform 0.2s ease, border-color 0.2s ease'
  },
  overdueCardActive: {
    background: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  distributionCard: {
    gridColumn: 'span 2',
    minWidth: '280px',
    '@media (max-width: 768px)': {
      gridColumn: 'span 1'
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.15rem'
  },
  cardTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  value: {
    fontSize: '1.95rem',
    fontWeight: '800',
    color: '#FFF',
    lineHeight: '1.1'
  },
  icon: {
    fontSize: '0.95rem'
  },
  warningTag: {
    fontSize: '0.95rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '18px',
    height: '18px'
  },
  badge: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block'
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginTop: '0.25rem'
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem'
  },
  lvlLabel: {
    color: '#94A3B8',
    fontWeight: '600',
    width: '24px'
  },
  barTrack: {
    flex: '1',
    height: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  lvlCount: {
    color: '#CBD5E1',
    fontWeight: '700',
    width: '15px',
    textAlign: 'right'
  }
};

export default Dashboard;
