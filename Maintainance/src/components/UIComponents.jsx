import React from 'react';
import './UIComponents.css';

export const StatCard = React.memo(({ label, value, icon, colorClass, sub }) => {
  return (
    <div className={`ui-stat-card ${colorClass}`}>
      <div className="ui-stat-icon">{icon}</div>
      <div className="ui-stat-label">{label}</div>
      <div className="ui-stat-value">{value}</div>
      {sub && <div className="ui-stat-sub">{sub}</div>}
    </div>
  );
});

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '500px' }) => {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div 
        className="ui-modal-box" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth }}
      >
        <div className="ui-modal-header">
          <h3 className="ui-modal-title">{title}</h3>
          <button className="ui-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="ui-modal-body">
          {children}
        </div>
        {footer && (
          <div className="ui-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Badge = React.memo(({ children, type = 'default', style }) => {
  return (
    <span className={`ui-badge ui-badge-${type}`} style={style}>
      {children}
    </span>
  );
});
