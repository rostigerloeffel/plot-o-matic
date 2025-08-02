import { useState, useEffect } from 'react';
import { Adventure, ViewMode } from './types';
import { AdventureLibrary } from './components/AdventureLibrary';
import { AdventureCreator } from './components/AdventureCreator';
import { AdventurePlayer } from './components/AdventurePlayer';
import { ApiKeyDialog } from './components/ApiKeyDialog';
import { useApiKey } from './hooks/useApiKey';
import { CURRENT_SCHEMA_VERSION } from './schemas/adventureSchema';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('play');
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  const { isConfigured, saveApiKey } = useApiKey();

  // Load adventures from localStorage on mount
  useEffect(() => {
    const savedAdventures = localStorage.getItem('plot-o-matic-adventures');
    if (savedAdventures) {
      try {
        const parsed = JSON.parse(savedAdventures);
        // Convert date strings back to Date objects and handle migration
        const adventuresWithDates = parsed.map((adv: any) => {
          // Handle migration from old format to new format
          if (adv.settings && adv.jsonData) {
            // Old format - migrate to new format
            return {
              id: adv.id,
              title: adv.title,
              description: adv.description,
              author: adv.author,
              version: "1.0",
              schemaVersion: CURRENT_SCHEMA_VERSION,
              creatorSettings: {
                scenario: adv.settings.scenario,
                seed: adv.settings.seed,
                difficulty: adv.settings.difficulty.level,
                rooms: adv.settings.rooms.amount,
                timeSystem: adv.settings.timeSystem.enabled,
                playerCanDie: adv.settings.playerCanDie.enabled,
                inventoryPuzzles: adv.settings.inventoryPuzzles.enabled,
                npcs: adv.settings.npcs.enabled,
                style: adv.settings.style
              },
              creationPrompt: "", // We don't have the original prompt for old adventures
              adventureData: JSON.parse(adv.jsonData),
              createdAt: new Date(adv.createdAt),
              updatedAt: new Date(adv.updatedAt)
            };
          } else {
            // New format - just convert dates
            return {
              ...adv,
              createdAt: new Date(adv.createdAt),
              updatedAt: new Date(adv.updatedAt)
            };
          }
        });
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

  const handleSaveAdventure = (creatorSettings: any, creationPrompt: string, adventureData: any) => {
    const newAdventure: Adventure = {
      id: `adventure_${Date.now()}`,
      title: adventureData.metadata?.title || `Abenteuer: ${creatorSettings.scenario.substring(0, 50)}${creatorSettings.scenario.length > 50 ? '...' : ''}`,
      description: adventureData.metadata?.description || `Ein ${creatorSettings.difficulty}es Abenteuer mit ${creatorSettings.rooms} Räumen.`,
      author: 'Plot-O-Matic',
      version: "1.0",
      schemaVersion: CURRENT_SCHEMA_VERSION,
      creatorSettings,
      creationPrompt,
      adventureData,
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