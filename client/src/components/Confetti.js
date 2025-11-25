import React, { useEffect, useState } from 'react';
import './Confetti.css';

const Confetti = ({ active }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (active) {
      // Generate 150 confetti pieces
      const pieces = [];
      for (let i = 0; i < 150; i++) {
        pieces.push({
          id: i,
          left: Math.random() * 100,
          animationDuration: 2 + Math.random() * 3,
          animationDelay: Math.random() * 0.5,
          color: [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
            '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e',
            '#00b894', '#e17055', '#74b9ff', '#a29bfe'
          ][Math.floor(Math.random() * 12)],
          shape: Math.random() > 0.5 ? 'square' : 'circle',
          size: 8 + Math.random() * 8
        });
      }
      setConfettiPieces(pieces);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfettiPieces([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active || confettiPieces.length === 0) return null;

  return (
    <div className="confetti-container">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className={`confetti-piece ${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDuration: `${piece.animationDuration}s`,
            animationDelay: `${piece.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
