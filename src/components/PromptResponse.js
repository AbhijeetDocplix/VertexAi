import React, { useState } from 'react';
import './PromptResponse.css';

const PromptResponse = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [model, setModel] = useState('medlm-medium');
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
      .then(() => setIsCopied(true))
      .catch(() => setIsCopied(false));

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleClear = () => {
    setText('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse('');
  
    try {
      const response = await fetch('https://stag-ai.docplix.online/generate-text-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, model }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setResponse(data.data); 
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Fetch request timed out');
        setResponse('Error: Request timed out');
      } else {
        console.error('Error fetching response:', error);
        setResponse(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="title">DocPlix AI</div>
      <div className="text-section">
        <h3>Text</h3>
        <textarea
          className="textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your text here..."
        />
        <div className="model-selection">
          <label>Select Model:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="medlm-medium">MedLM</option>
            <option value="gemini-1.5-pro-001">Gemini Pro</option>
          </select>
        </div>
        <div className="button-group">
          <button onClick={handleClear} disabled={!text}>
            Clear
          </button>
          <button onClick={handleCopy} disabled={!response}>
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Submit'}
          </button>
        </div>
      </div>
      <div className="response-section">
        <h3>Response</h3>
        <pre className="response">
          {response}
        </pre>
      </div>
    </div>
  );
};

export default PromptResponse;
