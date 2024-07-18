import React, { useState } from 'react';
import { marked } from 'marked';
import removeMarkdown from 'remove-markdown';
import './PromptResponse.css';
import logo from './logo.png';

const PromptResponse = () => {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [model, setModel] = useState('medlm-medium');
  const [loading, setLoading] = useState(false);


  const formatResponseForCopy = (text) => {

    const formattedText = text.replace(/\*\*(.*?)\*\*/g, (match, p1) => `<b>${p1}</b>`);
    return removeMarkdown(formattedText);
  };


  const handleCopy = () => {
    const formattedResponse = formatResponseForCopy(response);
    navigator.clipboard.writeText(formattedResponse)
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
        // text: `give this response in HTML`,
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
      <div className="title">
        <img src={logo} alt="Company Logo" className="logo" />
      </div>
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
            <option value="medlm-large">MedLM Large</option>
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
        <div
          className="response"
          dangerouslySetInnerHTML={{ __html: marked(response) }}
        />
      </div>
    </div>
  );
};

export default PromptResponse;
