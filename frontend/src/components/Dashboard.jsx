import React from 'react';

const Dashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="tasks-layout-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="glass-card shimmer-bg" style={{ height: '115px', border: '1px solid rgba(255,255,255,0.03)' }}></div>
        ))}
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
    <div className="tasks-layout-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      
      {/* Total Tasks Card */}
      <div className="glass-card ambient-glow-wrapper">
        <div className="ambient-glow-orb" style={{ '--orb-color': 'rgba(139, 92, 246, 0.25)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', zIndex: 2 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Tasks</span>
          <span style={{ fontSize: '1.25rem', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.3))' }}>📋</span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFF', lineHeight: '1.1', zIndex: 2 }}>
          {totalTasks}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', fontWeight: '600', zIndex: 2 }}>
          Accumulated workload
        </div>
      </div>

      {/* Pending Tasks Card */}
      <div className="glass-card ambient-glow-wrapper">
        <div className="ambient-glow-orb" style={{ '--orb-color': 'rgba(59, 130, 246, 0.25)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', zIndex: 2 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pending</span>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }}></span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFF', lineHeight: '1.1', zIndex: 2 }}>
          {pendingTasks}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', fontWeight: '600', zIndex: 2 }}>
          Awaiting completion
        </div>
      </div>

      {/* Completed Tasks Card */}
      <div className="glass-card ambient-glow-wrapper">
        <div className="ambient-glow-orb" style={{ '--orb-color': 'rgba(16, 185, 129, 0.25)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', zIndex: 2 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Completed</span>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--importance-2)', boxShadow: '0 0 8px var(--importance-2)' }}></span>
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#FFF', lineHeight: '1.1', zIndex: 2 }}>
          {completedTasks}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.3rem', fontWeight: '600', zIndex: 2 }}>
          Tasks finished successfully
        </div>
      </div>

      {/* Overdue Tasks Card */}
      <div className={`glass-card ambient-glow-wrapper ${overdueTasks > 0 ? 'task-card-overdue' : ''}`}
           style={{
             background: overdueTasks > 0 ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-card)',
             borderColor: overdueTasks > 0 ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-glow)'
           }}>
        <div className="ambient-glow-orb" style={{ '--orb-color': 'rgba(239, 68, 68, 0.3)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', zIndex: 2 }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '800',
            color: overdueTasks > 0 ? 'var(--importance-5)' : '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>Overdue</span>
          {overdueTasks > 0 ? (
            <span style={{ fontSize: '0.95rem', animation: 'spin 4s linear infinite', filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.6))' }}>⚠️</span>
          ) : (
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.15)' }}></span>
          )}
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          color: overdueTasks > 0 ? 'var(--importance-5)' : '#FFF',
          lineHeight: '1.1',
          zIndex: 2
        }}>
          {overdueTasks}
        </div>
        <div style={{ fontSize: '0.72rem', color: overdueTasks > 0 ? 'var(--importance-5)' : '#64748B', marginTop: '0.3rem', fontWeight: '600', zIndex: 2 }}>
          {overdueTasks > 0 ? 'Urgent attention required' : 'All deadlines secure'}
        </div>
      </div>

      {/* Importance Distribution Card */}
      <div className="glass-card ambient-glow-wrapper" style={{ gridColumn: 'span 2', minWidth: '300px' }}>
        <div className="ambient-glow-orb" style={{ '--orb-color': 'rgba(6, 182, 212, 0.2)' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', zIndex: 2 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Importance Distribution</span>
          <span style={{
            fontSize: '0.72rem',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-gold)',
            fontWeight: '800',
            padding: '0.15rem 0.55rem',
            borderRadius: '6px',
            boxShadow: '0 0 8px rgba(245, 158, 11, 0.15)'
          }}>
            Avg Score: {averageImportance.toFixed(2)}⭐
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem', zIndex: 2 }}>
          {[5, 4, 3, 2, 1].map(lvl => {
            const count = tasksByImportance[String(lvl)] || 0;
            const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            const barColors = {
              "5": 'linear-gradient(90deg, #EF4444 0%, #B91C1C 100%)',
              "4": 'linear-gradient(90deg, #F97316 0%, #C2410C 100%)',
              "3": 'linear-gradient(90deg, #8B5CF6 0%, #6D28D9 100%)',
              "2": 'linear-gradient(90deg, #10B981 0%, #047857 100%)',
              "1": 'linear-gradient(90deg, #64748B 0%, #475569 100%)'
            };

            return (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }} title={`${count} tasks at Importance Level ${lvl}`}>
                <span style={{ color: '#94A3B8', fontWeight: '700', width: '32px', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                  {lvl}<span style={{ color: 'var(--accent-gold)' }}>★</span>
                </span>
                <div style={{ flex: '1', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.02)' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '999px',
                    width: `${percentage}%`,
                    background: barColors[String(lvl)],
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: totalTasks > 0 && count > 0 ? '0 0 6px rgba(255, 255, 255, 0.1)' : 'none'
                  }}></div>
                </div>
                <span style={{ color: '#CBD5E1', fontWeight: '800', width: '22px', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;