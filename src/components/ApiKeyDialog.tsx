import React, { useState, useEffect } from 'react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load existing API key from localStorage
      const existingKey = localStorage.getItem('openai_api_key') || '';
      setApiKey(existingKey);
      setIsValid(existingKey.length > 0);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      onSave(apiKey.trim());
      onClose();
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setIsValid(value.trim().length > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="api-key-dialog-overlay">
      <div className="api-key-dialog">
        <div className="dialog-header">
          <h3>ChatGPT API-Schlüssel konfigurieren</h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>
        
        <div className="dialog-content">
          <p>
            Um Abenteuer zu erstellen und zu spielen, benötigen wir deinen OpenAI API-Schlüssel.
          </p>
          
          <div className="form-group">
            <label htmlFor="api-key">OpenAI API-Schlüssel:</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
            />
          </div>
          
          <div className="api-key-info">
            <h4>Wie bekomme ich einen API-Schlüssel?</h4>
            <ol>
              <li>Gehe zu <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
              <li>Erstelle ein Konto oder melde dich an</li>
              <li>Gehe zu "API Keys" in deinem Dashboard</li>
              <li>Erstelle einen neuen API-Schlüssel</li>
              <li>Kopiere den Schlüssel (beginnt mit "sk-")</li>
            </ol>
            <p className="note">
              <strong>Hinweis:</strong> Der API-Schlüssel wird nur lokal in deinem Browser gespeichert 
              und nicht an uns weitergegeben.
            </p>
          </div>
        </div>
        
        <div className="dialog-actions">
          <button onClick={onClose} className="cancel-button">
            Abbrechen
          </button>
          <button 
            onClick={handleSave}
            disabled={!isValid}
            className="save-button"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}; 