import React, { useRef, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css';
import './CodeEditor.css';

const CodeEditor = ({ value, onChange, onKeyDown }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const preRef = useRef(null);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="code-editor-container">
      <pre 
        ref={highlightRef}
        className="code-highlight-layer"
        aria-hidden="true"
      >
        <code ref={preRef} className="language-python">
          {value + '\n'}
        </code>
      </pre>
      <textarea
        ref={textareaRef}
        className="code-input-layer"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        placeholder="# Write your code here..."
        spellCheck="false"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};

export default CodeEditor;
