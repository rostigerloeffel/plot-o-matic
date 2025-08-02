import React from 'react';
import { Adventure } from '../types';

interface AdventureLibraryProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
}

export const AdventureLibrary: React.FC<AdventureLibraryProps> = ({
  adventures,
  onSelectAdventure,
  onDeleteAdventure
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="adventure-library">
      <div className="library-header">
        <h2>Abenteuer spielen</h2>
        <p>Wähle ein gespeichertes Abenteuer aus, um es zu spielen.</p>
      </div>

      {adventures.length === 0 ? (
        <div className="empty-library">
          <p>Keine Abenteuer vorhanden.</p>
          <p>Erstelle zuerst ein neues Abenteuer im "Abenteuer erstellen" Tab!</p>
        </div>
      ) : (
        <div className="adventures-grid">
          {adventures.map((adventure) => (
            <div key={adventure.id} className="adventure-card">
              <div className="adventure-header">
                <h3>{adventure.title}</h3>
                <div className="adventure-meta">
                  <span>von {adventure.author}</span>
                  <span>{formatDate(adventure.updatedAt)}</span>
                </div>
              </div>
              
              <div className="adventure-description">
                {adventure.description || 'Keine Beschreibung verfügbar.'}
              </div>
              
              <div className="adventure-settings">
                <span>Schwierigkeit: {adventure.creatorSettings.difficulty}</span>
                <span>Räume: {adventure.creatorSettings.rooms}</span>
                {adventure.creatorSettings.npcs && <span>NPCs</span>}
                {adventure.creatorSettings.inventoryPuzzles && <span>Inventar-Rätsel</span>}
              </div>
              
              <div className="adventure-actions">
                <button 
                  onClick={() => onSelectAdventure(adventure)}
                  className="play-button"
                >
                  Spielen
                </button>
                <button 
                  onClick={() => onDeleteAdventure(adventure.id)}
                  className="delete-button"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 