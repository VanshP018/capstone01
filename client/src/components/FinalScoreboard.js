import React from 'react';
import './FinalScoreboard.css';

const FinalScoreboard = ({ isOpen, participants, scores, timeExpired, questionsCompleted, onClose }) => {
  if (!isOpen) return null;

  // Calculate rankings
  const rankings = participants.map(participant => {
    const userId = participant._id || participant.id;
    const score = scores[userId] || 0;
    return {
      userId,
      username: participant.username,
      score
    };
  }).sort((a, b) => b.score - a.score);

  // Check if this is a single winner scenario
  const isSingleWinner = rankings.length === 1;

  // Determine session end reason
  let sessionEndMessage;
  if (isSingleWinner) {
    sessionEndMessage = 'Victory by Default - All Opponents Left';
  } else if (timeExpired) {
    sessionEndMessage = `Time's Up! - ${questionsCompleted || 0} Question${(questionsCompleted || 0) !== 1 ? 's' : ''} Completed`;
  } else {
    sessionEndMessage = `Session Complete! - ${questionsCompleted || 3} Questions Completed`;
  }

  return (
    <div className="final-scoreboard-overlay">
      <div className="final-scoreboard-modal">
        <div className="final-scoreboard-header">
          <div className="trophy-icon">{isSingleWinner ? '👑' : timeExpired ? '⏱️' : '🏆'}</div>
          <h2>{isSingleWinner ? 'Victory!' : timeExpired ? 'Time Expired!' : 'Session Complete!'}</h2>
          <p className="session-subtitle">{sessionEndMessage}</p>
        </div>

        <div className="final-scoreboard-body">
          <div className="rankings-list">
            {rankings.map((player, index) => (
              <div 
                key={player.userId} 
                className={`ranking-item rank-${index + 1}`}
              >
                <div className="rank-badge">
                  {index === 0 && <span className="medal gold">🥇</span>}
                  {index === 1 && <span className="medal silver">🥈</span>}
                  {index === 2 && <span className="medal bronze">🥉</span>}
                  {index > 2 && <span className="rank-number">#{index + 1}</span>}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.username}</span>
                </div>
                <div className="player-score">
                  <span className="score-value">{player.score}</span>
                  <span className="score-label">points</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="final-scoreboard-footer">
          <button className="return-dashboard-btn" onClick={onClose}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalScoreboard;
