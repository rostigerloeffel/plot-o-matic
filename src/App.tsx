import { useState, useEffect } from 'react';
import { Adventure, ViewMode } from './types';
import { GameEngine } from './components/GameEngine';
import { AdventureEditor } from './components/AdventureEditor';
import { AdventureLibrary } from './components/AdventureLibrary';

// Sample adventure for demonstration
const sampleAdventure: Adventure = {
  id: 'sample_adventure',
  title: 'Das mysteriöse Schloss',
  description: 'Ein interaktives Abenteuer in einem alten Schloss voller Geheimnisse.',
  author: 'Plot-O-Matic',
  startNodeId: 'start',
  nodes: [
    {
      id: 'start',
      text: 'Du stehst vor einem alten, verfallenen Schloss. Die Luft ist feucht und kalt. Vor dir siehst du eine große Holztür mit eisernen Beschlägen. Was tust du?',
      choices: [
        {
          id: 'choice_1',
          text: 'Die Tür öffnen und hineingehen',
          nextNodeId: 'inside_castle'
        },
        {
          id: 'choice_2',
          text: 'Das Schloss von außen erkunden',
          nextNodeId: 'explore_outside'
        },
        {
          id: 'choice_3',
          text: 'Weggehen und nach Hause zurückkehren',
          nextNodeId: 'go_home'
        }
      ]
    },
    {
      id: 'inside_castle',
      text: 'Du öffnest die knarrende Tür und trittst in eine große Halle ein. Der Boden ist mit Staub bedeckt und alte Fackeln hängen an den Wänden. Du hörst ein leises Rascheln aus der Dunkelheit.',
      choices: [
        {
          id: 'choice_4',
          text: 'Dem Geräusch folgen',
          nextNodeId: 'follow_sound'
        },
        {
          id: 'choice_5',
          text: 'Die Halle genauer untersuchen',
          nextNodeId: 'examine_hall'
        }
      ]
    },
    {
      id: 'explore_outside',
      text: 'Du umrundest das Schloss und entdeckst einen versteckten Eingang im Garten. Eine kleine Tür führt in den Keller.',
      choices: [
        {
          id: 'choice_6',
          text: 'Durch die Kellertür gehen',
          nextNodeId: 'basement'
        },
        {
          id: 'choice_7',
          text: 'Zurück zur Haupttür',
          nextNodeId: 'start'
        }
      ]
    },
    {
      id: 'go_home',
      text: 'Du beschließt, dass es besser ist, nicht allein in ein altes Schloss zu gehen. Du kehrst nach Hause zurück und erzählst niemandem von deinem Abenteuer.',
      choices: [],
      isEnd: true
    },
    {
      id: 'follow_sound',
      text: 'Du folgst dem Geräusch und findest eine kleine Maus, die sich in einer Ecke versteckt hat. Sie scheint dich zu führen.',
      choices: [
        {
          id: 'choice_8',
          text: 'Der Maus folgen',
          nextNodeId: 'follow_mouse'
        },
        {
          id: 'choice_9',
          text: 'Zurück zur Halle',
          nextNodeId: 'inside_castle'
        }
      ]
    },
    {
      id: 'examine_hall',
      text: 'Du untersuchst die Halle genauer und findest eine alte Schatztruhe hinter einem Vorhang. Sie ist verschlossen.',
      choices: [
        {
          id: 'choice_10',
          text: 'Versuchen, die Truhe zu öffnen',
          nextNodeId: 'open_chest'
        },
        {
          id: 'choice_11',
          text: 'Nach einem Schlüssel suchen',
          nextNodeId: 'search_key'
        }
      ]
    },
    {
      id: 'basement',
      text: 'Im Keller findest du eine alte Bibliothek mit staubigen Büchern. Ein Buch fällt von einem Regal und öffnet sich.',
      choices: [
        {
          id: 'choice_12',
          text: 'Das Buch lesen',
          nextNodeId: 'read_book'
        },
        {
          id: 'choice_13',
          text: 'Zurück nach oben',
          nextNodeId: 'start'
        }
      ]
    },
    {
      id: 'follow_mouse',
      text: 'Die Maus führt dich zu einem versteckten Raum hinter einer Wand. Dort findest du einen alten Schatz! Du hast das Geheimnis des Schlosses gelöst.',
      choices: [],
      isEnd: true
    },
    {
      id: 'open_chest',
      text: 'Du versuchst die Truhe zu öffnen, aber sie ist fest verschlossen. Plötzlich hörst du Schritte von oben. Jemand kommt!',
      choices: [
        {
          id: 'choice_14',
          text: 'Schnell verstecken',
          nextNodeId: 'hide'
        },
        {
          id: 'choice_15',
          text: 'Dem Geräusch entgegengehen',
          nextNodeId: 'confront'
        }
      ]
    },
    {
      id: 'search_key',
      text: 'Du suchst nach einem Schlüssel und findest ihn schließlich in einer alten Vase. Die Truhe öffnet sich und enthüllt eine wertvolle Karte.',
      choices: [],
      isEnd: true
    },
    {
      id: 'read_book',
      text: 'Das Buch erzählt die Geschichte des Schlosses und seiner Bewohner. Du lernst viel über die Vergangenheit und fühlst dich bereichert.',
      choices: [],
      isEnd: true
    },
    {
      id: 'hide',
      text: 'Du versteckst dich hinter einem Vorhang. Ein alter Diener kommt die Treppe herunter, sieht sich um und geht wieder. Du hast Glück gehabt!',
      choices: [],
      isEnd: true
    },
    {
      id: 'confront',
      text: 'Du gehst den Schritten entgegen und triffst auf den alten Schlossherrn. Er ist freundlich und zeigt dir das Schloss. Du hast einen neuen Freund gefunden.',
      choices: [],
      isEnd: true
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('play');
  const [adventures, setAdventures] = useState<Adventure[]>([sampleAdventure]);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [editingAdventure, setEditingAdventure] = useState<Adventure | null>(null);

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
    setViewMode('play');
  };

  const handleEditAdventure = (adventure: Adventure) => {
    setEditingAdventure(adventure);
    setViewMode('edit');
  };

  const handleDeleteAdventure = (adventureId: string) => {
    if (confirm('Möchtest du dieses Abenteuer wirklich löschen?')) {
      setAdventures(prev => prev.filter(adv => adv.id !== adventureId));
      if (currentAdventure?.id === adventureId) {
        setCurrentAdventure(null);
      }
    }
  };

  const handleCreateNew = () => {
    setEditingAdventure(null);
    setViewMode('create');
  };

  const handleSaveAdventure = (adventure: Adventure) => {
    if (editingAdventure) {
      // Update existing adventure
      setAdventures(prev => prev.map(adv => 
        adv.id === adventure.id ? adventure : adv
      ));
    } else {
      // Add new adventure
      setAdventures(prev => [...prev, adventure]);
    }
    setEditingAdventure(null);
    setViewMode('play');
  };

  const handleCancelEdit = () => {
    setEditingAdventure(null);
    setViewMode('play');
  };

  const handleGameEnd = () => {
    // Could add game end logic here
    console.log('Game ended');
  };

  const handleBackToLibrary = () => {
    setCurrentAdventure(null);
    setViewMode('play');
  };

  return (
    <div className="container">
      <div className="menu">
        <button 
          className={viewMode === 'play' && !currentAdventure ? 'active' : ''}
          onClick={() => {
            setViewMode('play');
            setCurrentAdventure(null);
          }}
        >
          Bibliothek
        </button>
        <button 
          className={viewMode === 'create' ? 'active' : ''}
          onClick={handleCreateNew}
        >
          Neues Abenteuer
        </button>
        {currentAdventure && (
          <button onClick={handleBackToLibrary}>
            Zurück zur Bibliothek
          </button>
        )}
      </div>

      {viewMode === 'play' && !currentAdventure && (
        <AdventureLibrary
          adventures={adventures}
          onSelectAdventure={handleSelectAdventure}
          onEditAdventure={handleEditAdventure}
          onDeleteAdventure={handleDeleteAdventure}
          onCreateNew={handleCreateNew}
        />
      )}

      {viewMode === 'play' && currentAdventure && (
        <GameEngine
          adventure={currentAdventure}
          onGameEnd={handleGameEnd}
        />
      )}

      {(viewMode === 'edit' || viewMode === 'create') && (
        <AdventureEditor
          adventure={editingAdventure || undefined}
          onSave={handleSaveAdventure}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
}

export default App; 