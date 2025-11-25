import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateBoilerplate } from '../utils/boilerplateGenerator';
import CodeEditor from '../components/CodeEditor';
import SubmitModal from '../components/SubmitModal';
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
  const [boilerplateSet, setBoilerplateSet] = useState(false); // Track if boilerplate is already set
  const [testResult, setTestResult] = useState(null); // 'pass', 'fail', or null
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTestResults, setSubmitTestResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          // Only set boilerplate once on initial load
          if (!boilerplateSet) {
            const boilerplate = generateBoilerplate(selectedQuestion);
            setCodeInput(boilerplate);
            setBoilerplateSet(true);
          }
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
  }, [code, boilerplateSet]);

  const handleRunCode = async () => {
    if (!codeInput.trim()) {
      setOutput('Error: Please write some code first');
      setTestResult(null);
      return;
    }

    setIsRunning(true);
    setOutput('Running code...\n');
    setTestResult(null);
    
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
        let actualOutput = '';
        
        if (data.run.stdout) {
          actualOutput = data.run.stdout.trim();
          outputText += '=== Output ===\n' + data.run.stdout;
        }
        
        if (data.run.stderr) {
          outputText += '\n=== Errors ===\n' + data.run.stderr;
          setTestResult('fail');
        }
        
        if (data.run.code !== 0) {
          outputText += `\n\nExit code: ${data.run.code}`;
          setTestResult('fail');
        }
        
        if (!data.run.stdout && !data.run.stderr) {
          outputText = 'Code executed successfully with no output.';
        }

        // Compare with expected output from sample testcase
        if (question && question.sample_testcase && actualOutput && !data.run.stderr && data.run.code === 0) {
          const expectedOutput = String(question.sample_testcase.output).trim();
          const normalizedActual = actualOutput.replace(/\s+/g, ' ');
          const normalizedExpected = expectedOutput.replace(/\s+/g, ' ');
          
          if (normalizedActual === normalizedExpected) {
            setTestResult('pass');
            outputText += `\n\n✓ Sample test case passed!`;
          } else {
            setTestResult('fail');
            outputText += `\n\n✗ Sample test case failed`;
            outputText += `\nExpected: ${expectedOutput}`;
            outputText += `\nGot: ${actualOutput}`;
          }
        }

        setOutput(outputText || 'No output');
      } else {
        setOutput('Error: Failed to execute code');
        setTestResult('fail');
      }
    } catch (err) {
      setOutput('Error executing code: ' + err.message);
      setTestResult('fail');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || !question.testcases) {
      alert('No test cases available for this question');
      return;
    }

    // Initialize test results
    const initialResults = question.testcases.map((_, index) => ({
      status: 'pending',
      expected: null,
      actual: null,
      error: null
    }));
    
    setSubmitTestResults(initialResults);
    setShowSubmitModal(true);
    setIsSubmitting(true);

    // Run test cases one by one
    let allPassed = true;
    for (let i = 0; i < question.testcases.length; i++) {
      const testcase = question.testcases[i];
      
      // Update status to running
      setSubmitTestResults(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'running' };
        return updated;
      });

      try {
        // Generate code with test case input
        let testCode = codeInput;
        
        // Parse the input and create appropriate function call
        const input = testcase.input;
        let functionCall = '';
        
        if (typeof input === 'object' && !Array.isArray(input)) {
          // Object input (multiple parameters)
          const params = Object.keys(input);
          const args = params.map(p => JSON.stringify(input[p])).join(', ');
          functionCall = `result = solution(${args})`;
        } else if (Array.isArray(input)) {
          functionCall = `result = solution(${JSON.stringify(input)})`;
        } else if (typeof input === 'string') {
          functionCall = `result = solution("${input}")`;
        } else {
          functionCall = `result = solution(${input})`;
        }

        // Replace the test code in boilerplate
        testCode = testCode.replace(
          /if __name__ == "__main__":[\s\S]*/,
          `if __name__ == "__main__":\n    ${functionCall}\n    print(result)`
        );

        // Execute code
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'python',
            version: '3.10.0',
            files: [{ name: 'main.py', content: testCode }],
            stdin: '',
            args: [],
            compile_timeout: 10000,
            run_timeout: 3000
          })
        });

        const data = await response.json();

        if (data.run && data.run.code === 0 && !data.run.stderr) {
          const actualOutput = data.run.stdout.trim();
          const expectedOutput = String(testcase.output).trim();
          
          const normalizedActual = actualOutput.replace(/\s+/g, ' ');
          const normalizedExpected = expectedOutput.replace(/\s+/g, ' ');

          if (normalizedActual === normalizedExpected) {
            // Test passed
            setSubmitTestResults(prev => {
              const updated = [...prev];
              updated[i] = {
                status: 'passed',
                expected: expectedOutput,
                actual: actualOutput,
                error: null
              };
              return updated;
            });
          } else {
            // Test failed
            allPassed = false;
            setSubmitTestResults(prev => {
              const updated = [...prev];
              updated[i] = {
                status: 'failed',
                expected: expectedOutput,
                actual: actualOutput,
                error: 'Output mismatch'
              };
              return updated;
            });
          }
        } else {
          // Execution error
          allPassed = false;
          setSubmitTestResults(prev => {
            const updated = [...prev];
            updated[i] = {
              status: 'failed',
              expected: String(testcase.output),
              actual: data.run?.stderr || 'Execution error',
              error: 'Runtime error'
            };
            return updated;
          });
        }
      } catch (err) {
        allPassed = false;
        setSubmitTestResults(prev => {
          const updated = [...prev];
          updated[i] = {
            status: 'failed',
            expected: String(testcase.output),
            actual: err.message,
            error: 'Execution failed'
          };
          return updated;
        });
      }

      // Small delay between tests for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsSubmitting(false);
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
            <p>{question.description}</p>
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
          <CodeEditor
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="output-section">
          <div className="output-header">
            <div className="output-title-wrapper">
              <h4>Output</h4>
              {testResult === 'pass' && (
                <span className="test-result-badge test-pass">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#00b8a3" />
                    <path d="M4 8l2.5 2.5L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Passed
                </span>
              )}
              {testResult === 'fail' && (
                <span className="test-result-badge test-fail">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#ef476f" />
                    <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Failed
                </span>
              )}
            </div>
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

      {/* Submit Modal */}
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        testResults={submitTestResults}
        isRunning={isSubmitting}
        allPassed={submitTestResults.length > 0 && submitTestResults.every(r => r.status === 'passed')}
      />
    </div>
  );
};

export default Battle;
