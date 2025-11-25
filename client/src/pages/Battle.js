import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Battle.css';

const Battle = ({ user }) => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [codeInput, setCodeInput] = useState('# Write your solution here\n\ndef solution():\n    pass\n\n# Test your code\nif __name__ == "__main__":\n    result = solution()\n    print(result)');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchBattleQuestion = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get room details
        const roomResponse = await fetch(`http://localhost:5001/api/rooms/${code}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const roomData = await roomResponse.json();

        if (!roomData.success) {
          setError(roomData.message);
          setLoading(false);
          return;
        }

        // Check if battle started and has questionId
        const room = roomData.room;
        
        if (!room.battleStarted || !room.questionId) {
          setError('Battle not started yet');
          setLoading(false);
          return;
        }

        // Fetch question from question bank
        const questionResponse = await fetch('/questionBank.json');
        const questionBankData = await questionResponse.json();
        
        const selectedQuestion = questionBankData.questions.find(
          q => q.id === room.questionId
        );

        if (selectedQuestion) {
          setQuestion(selectedQuestion);
          setError('');
        } else {
          setError('Question not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching battle question:', err);
        setError('Error loading battle question');
        setLoading(false);
      }
    };

    fetchBattleQuestion();
    // Poll for updates every 2 seconds
    const interval = setInterval(fetchBattleQuestion, 2000);
    return () => clearInterval(interval);
  }, [code]);

  const handleRunCode = async () => {
    if (!codeInput.trim()) {
      setOutput('Error: Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('Running code...\n');
    
    try {
      // Using Piston API for code execution
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [
            {
              name: 'main.py',
              content: codeInput
            }
          ],
          stdin: '',
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1
        })
      });

      const data = await response.json();

      if (data.run) {
        let outputText = '';
        
        if (data.run.stdout) {
          outputText += '=== Output ===\n' + data.run.stdout;
        }
        
        if (data.run.stderr) {
          outputText += '\n=== Errors ===\n' + data.run.stderr;
        }
        
        if (data.run.code !== 0) {
          outputText += `\n\nExit code: ${data.run.code}`;
        }
        
        if (!data.run.stdout && !data.run.stderr) {
          outputText = 'Code executed successfully with no output.';
        }

        setOutput(outputText || 'No output');
      } else {
        setOutput('Error: Failed to execute code');
      }
    } catch (err) {
      setOutput('Error executing code: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    // First run the code
    await handleRunCode();
    
    // Show submission feedback
    setTimeout(() => {
      alert('Code submitted successfully! Full test suite evaluation coming soon.');
    }, 500);
  };

  const handleLeave = () => {
    navigate(`/room/${code}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      
      // Insert 4 spaces at cursor position
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setCodeInput(newValue);
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (loading) {
    return (
      <div className="battle-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading battle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={handleLeave} className="back-btn">Back to Room</button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="battle-page">
        <div className="error-container">
          <p>No question available</p>
          <button onClick={handleLeave} className="back-btn">Back to Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="battle-page">
      {/* Question Panel - Left Side */}
      <div className="question-panel">
        <div className="question-header">
          <div className="question-title-row">
            <h2>{question.title}</h2>
            <span className={`difficulty-badge ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          </div>
          <div className="question-tags">
            {question.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="question-content">
          <section className="question-section">
            <h3>Problem Statement</h3>
            <p>{question.statement}</p>
          </section>

          <section className="question-section">
            <h3>Input Format</h3>
            <div className="format-box">
              {typeof question.input_format === 'object' ? (
                Object.entries(question.input_format).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))
              ) : (
                <p>{question.input_format}</p>
              )}
            </div>
          </section>

          <section className="question-section">
            <h3>Output Format</h3>
            <div className="format-box">
              <p>{question.output_format}</p>
            </div>
          </section>

          <section className="question-section">
            <h3>Constraints</h3>
            <div className="format-box">
              <p>{question.constraints}</p>
            </div>
          </section>

          <section className="question-section">
            <h3>Sample Test Case</h3>
            <div className="testcase-box">
              <div className="testcase-item">
                <strong>Input:</strong>
                <pre>{JSON.stringify(question.sample_testcase.input, null, 2)}</pre>
              </div>
              <div className="testcase-item">
                <strong>Output:</strong>
                <pre>{JSON.stringify(question.sample_testcase.output, null, 2)}</pre>
              </div>
            </div>
          </section>

          <section className="question-section">
            <h3>Explanation</h3>
            <p>{question.explanation}</p>
          </section>
        </div>
      </div>

      {/* Code Editor Panel - Right Side */}
      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-controls">
            <div className="language-info">
              <span className="language-badge">🐍 Python 3.10</span>
              <span className="status-text">Real-time execution enabled</span>
            </div>
            <button onClick={handleLeave} className="leave-battle-btn">
              ← Leave Battle
            </button>
          </div>
        </div>

        <div className="code-editor">
          <textarea
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Write your code here..."
            spellCheck="false"
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <h4>Output</h4>
            <div className="action-buttons">
              <button 
                onClick={handleRunCode} 
                disabled={isRunning}
                className="run-btn"
              >
                {isRunning ? 'Running...' : '▶ Run Code'}
              </button>
              <button 
                onClick={handleSubmit}
                className="submit-btn"
              >
                Submit
              </button>
            </div>
          </div>
          <div className="output-content">
            <pre>{output || 'Run your code to see output...'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battle;
