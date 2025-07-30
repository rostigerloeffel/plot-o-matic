import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfigured(true);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    setIsConfigured(true);
  };

  const clearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsConfigured(false);
  };

  return {
    apiKey,
    isConfigured,
    saveApiKey,
    clearApiKey
  };
}; 