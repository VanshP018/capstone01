import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ timerStartedAt, timerDuration, onTimeExpired }) => {
  const [timeRemaining, setTimeRemaining] = useState(timerDuration);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!timerStartedAt) return;

    const calculateTimeRemaining = () => {
      const startTime = new Date(timerStartedAt).getTime();
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const remaining = Math.max(0, timerDuration - elapsed);

      return remaining;
    };

    // Initial calculation
    const remaining = calculateTimeRemaining();
    setTimeRemaining(remaining);

    if (remaining === 0) {
      setIsExpired(true);
      if (onTimeExpired) {
        onTimeExpired();
      }
      return;
    }

    // Update every second
    const intervalId = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        clearInterval(intervalId);
        if (onTimeExpired) {
          onTimeExpired();
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timerStartedAt, timerDuration, onTimeExpired]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    const percentage = (timeRemaining / timerDuration) * 100;
    if (isExpired) return 'timer-expired';
    if (percentage <= 10) return 'timer-critical';
    if (percentage <= 30) return 'timer-warning';
    return 'timer-normal';
  };

  const getTimerValueColor = () => {
    const percentage = (timeRemaining / timerDuration) * 100;
    if (isExpired) return '#666';
    if (percentage <= 10) return '#ef476f';
    if (percentage <= 30) return '#ffc01e';
    return '#569cd6';
  };

  return (
    <div className={`timer-container ${getTimerClass()}`}>
      <div className="timer-icon">⏱️</div>
      <div className="timer-display">
        <div className="timer-label">Time Remaining</div>
        <div className="timer-value" style={{ color: getTimerValueColor() }}>
          {isExpired ? 'TIME UP!' : formatTime(timeRemaining)}
        </div>
      </div>
      <div className="timer-bar-container">
        <div 
          className="timer-bar-fill" 
          style={{ 
            width: `${(timeRemaining / timerDuration) * 100}%`,
            background: getTimerValueColor()
          }}
        />
      </div>
    </div>
  );
};

export default Timer;
