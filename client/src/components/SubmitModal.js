import React from 'react';
import Confetti from './Confetti';
import './SubmitModal.css';

const SubmitModal = ({ isOpen, onClose, testResults, isRunning, allPassed }) => {
  if (!isOpen) return null;

  return (
    <>
      <Confetti active={allPassed && !isRunning} />
      <div className="submit-modal-overlay" onClick={onClose}>
        <div className="submit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="submit-modal-header">
          <h3>Running Test Cases</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="submit-modal-body">
          {testResults.map((result, index) => (
            <div key={index} className={`test-case-item ${result.status}`}>
              <div className="test-case-label">
                <span className="test-number">Test Case {index + 1}</span>
              </div>
              
              <div className="test-case-status">
                {result.status === 'pending' && (
                  <div className="spinner-small"></div>
                )}
                {result.status === 'running' && (
                  <>
                    <div className="spinner-small"></div>
                    <span className="status-text">Running...</span>
                  </>
                )}
                {result.status === 'passed' && (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#00b8a3" />
                      <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="status-text success-text">Passed</span>
                  </>
                )}
                {result.status === 'failed' && (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#ef476f" />
                      <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="status-text error-text">Failed</span>
                  </>
                )}
              </div>
              
              {result.status === 'failed' && result.error && (
                <div className="test-case-error">
                  <div className="error-details">
                    <span className="error-label">Expected:</span> {result.expected}
                  </div>
                  <div className="error-details">
                    <span className="error-label">Got:</span> {result.actual}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {allPassed && !isRunning && (
          <div className="congratulations-section">
            <div className="congrats-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#00b8a3" opacity="0.2"/>
                <circle cx="32" cy="32" r="24" fill="#00b8a3"/>
                <path d="M20 32l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="congrats-title">Congratulations! 🎉</h2>
            <p className="congrats-message">All test cases passed successfully!</p>
            <p className="next-question-message">Loading next question...</p>
          </div>
        )}

        {!allPassed && !isRunning && testResults.some(r => r.status === 'failed') && (
          <div className="submit-modal-footer">
            <button className="retry-btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SubmitModal;
