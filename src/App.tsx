import { useState, useEffect } from 'react';
import { Adventure, ViewMode, AdventureSettings } from './types';
import { AdventureLibrary } from './components/AdventureLibrary';
import { AdventureCreator } from './components/AdventureCreator';
import { AdventurePlayer } from './components/AdventurePlayer';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { useApiKey } from './hooks/useApiKey';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('play');
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const { apiKey, isConfigured, saveApiKey } = useApiKey();

  // Load adventures from localStorage on mount
  useEffect(() => {
    const savedAdventures = localStorage.getItem('plot-o-matic-adventures');
    if (savedAdventures) {
      try {
        const parsed = JSON.parse(savedAdventures);
        // Convert date strings back to Date objects
        const adventuresWithDates = parsed.map((adv: any) => ({
          ...adv,
          createdAt: new Date(adv.createdAt),
          updatedAt: new Date(adv.updatedAt)
        }));
        setAdventures(adventuresWithDates);
      } catch (error) {
        console.error('Error loading adventures:', error);
      }
    }
  }, []);

  // Save adventures to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('plot-o-matic-adventures', JSON.stringify(adventures));
  }, [adventures]);

  const handleSelectAdventure = (adventure: Adventure) => {
    setCurrentAdventure(adventure);
  };

  const handleDeleteAdventure = (adventureId: string) => {
    if (confirm('Möchtest du dieses Abenteuer wirklich löschen?')) {
      setAdventures(prev => prev.filter(adv => adv.id !== adventureId));
      if (currentAdventure?.id === adventureId) {
        setCurrentAdventure(null);
      }
    }
  };

  const handleSaveAdventure = (settings: AdventureSettings, jsonData: string) => {
    const newAdventure: Adventure = {
      id: `adventure_${Date.now()}`,
      title: `Abenteuer: ${settings.scenario.substring(0, 50)}${settings.scenario.length > 50 ? '...' : ''}`,
      description: `Ein ${settings.difficulty.level}es Abenteuer mit ${settings.rooms.amount} Räumen.`,
      author: 'Plot-O-Matic',
      settings,
      jsonData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAdventures(prev => [...prev, newAdventure]);
    setViewMode('play');
  };

  const handleBackToLibrary = () => {
    setCurrentAdventure(null);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="menu">
          <button 
            className={viewMode === 'play' && !currentAdventure ? 'active' : ''}
            onClick={() => {
              setViewMode('play');
              setCurrentAdventure(null);
            }}
          >
            Abenteuer spielen
          </button>
          <button 
            className={viewMode === 'create' ? 'active' : ''}
            onClick={() => {
              setViewMode('create');
              setCurrentAdventure(null);
            }}
          >
            Abenteuer erstellen
          </button>
        </div>
        
        <button 
          className={`api-key-button ${isConfigured ? 'configured' : 'not-configured'}`}
          onClick={() => setIsApiKeyDialogOpen(true)}
          title={isConfigured ? 'API-Schlüssel ändern' : 'API-Schlüssel konfigurieren'}
        >
          {isConfigured ? '🔑' : '⚙️'}
        </button>
      </div>

      {viewMode === 'play' && !currentAdventure && (
        <AdventureLibrary
          adventures={adventures}
          onSelectAdventure={handleSelectAdventure}
          onDeleteAdventure={handleDeleteAdventure}
        />
      )}

      {viewMode === 'play' && currentAdventure && (
        <AdventurePlayer
          adventure={currentAdventure}
          onBack={handleBackToLibrary}
        />
      )}

      {viewMode === 'create' && (
        <AdventureCreator
          onSave={handleSaveAdventure}
          onCancel={() => setViewMode('play')}
        />
      )}
      
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={saveApiKey}
      />
    </div>
  );
}

export default App; 