import React from 'react';
import { Adventure } from '../types';

interface AdventureLibraryProps {
  adventures: Adventure[];
  onSelectAdventure: (adventure: Adventure) => void;
  onEditAdventure: (adventure: Adventure) => void;
  onDeleteAdventure: (adventureId: string) => void;
  onCreateNew: () => void;
}

export const AdventureLibrary: React.FC<AdventureLibraryProps> = ({
  adventures,
  onSelectAdventure,
  onEditAdventure,
  onDeleteAdventure,
  onCreateNew
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
        <h2>Abenteuer-Bibliothek</h2>
        <button onClick={onCreateNew} className="create-button">
          Neues Abenteuer erstellen
        </button>
      </div>

      {adventures.length === 0 ? (
        <div className="empty-library">
          <p>Keine Abenteuer vorhanden.</p>
          <p>Erstelle dein erstes Abenteuer!</p>
        </div>
      ) : (
        <div className="adventures-grid">
          {adventures.map(adventure => (
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
              
              <div className="adventure-stats">
                <span>{adventure.nodes.length} Knoten</span>
                <span>{adventure.nodes.filter(n => n.isEnd).length} Enden</span>
              </div>
              
              <div className="adventure-actions">
                <button 
                  onClick={() => onSelectAdventure(adventure)}
                  className="play-button"
                >
                  Spielen
                </button>
                <button 
                  onClick={() => onEditAdventure(adventure)}
                  className="edit-button"
                >
                  Bearbeiten
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