import React, { useState } from 'react';
import './PromptResponse.css';

const PromptResponse = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [model, setModel] = useState('gemini-1.5-flash-001'); 

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => setIsCopied(true))
      .catch(() => setIsCopied(false));
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://stag.docplix.online/api/docplix/ai/generate-text-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, model })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.data); 
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="text-section">
        <h3>Text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your text here..."
        />
        <div className="model-selection">
          <label>Select Model:</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="gemini-1.5-flash-001">Gemini Flash</option>
            <option value="gemini-1.5-pro-001">Gemini Pro</option>
          </select>
        </div>
        <div className="button-group">
          <button onClick={handleCopy}>
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleSubmit}>Submit</button>
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
