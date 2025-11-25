import React, { useEffect } from 'react';
import './LeaveNotification.css';

const LeaveNotification = ({ username, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="leave-notification">
      <div className="leave-notification-content">
        <div className="leave-icon">👋</div>
        <div className="leave-message">
          <strong>{username}</strong> has left the arena
        </div>
        <button className="close-notification" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default LeaveNotification;
