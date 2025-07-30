import React, { useState } from 'react';
import { AdventureSettings } from '../types';
import { generateAdventurePrompt } from '../templates/adventurePrompt';

interface AdventureCreatorProps {
  onSave: (settings: AdventureSettings, jsonData: string) => void;
  onCancel: () => void;
}

export const AdventureCreator: React.FC<AdventureCreatorProps> = ({
  onSave,
  onCancel
}) => {
  const [settings, setSettings] = useState<AdventureSettings>({
    scenario: '',
    difficulty: {
      level: 'mittel',
      additionalText: ''
    },
    rooms: {
      amount: 'mittel',
      additionalText: ''
    },
    timeSystem: {
      enabled: false,
      additionalText: ''
    },
    playerCanDie: {
      enabled: false,
      additionalText: ''
    },
    inventoryPuzzles: {
      enabled: false,
      additionalText: ''
    },
    npcs: {
      enabled: false,
      additionalText: ''
    },
    style: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJson, setGeneratedJson] = useState<string>('');

  const generatePrompt = (settings: AdventureSettings): string => {
    return generateAdventurePrompt({
      scenario: settings.scenario,
      difficulty: settings.difficulty.level,
      difficultyText: settings.difficulty.additionalText,
      rooms: settings.rooms.amount,
      roomsText: settings.rooms.additionalText,
      timeSystem: settings.timeSystem.enabled,
      timeSystemText: settings.timeSystem.additionalText,
      playerCanDie: settings.playerCanDie.enabled,
      playerCanDieText: settings.playerCanDie.additionalText,
      inventoryPuzzles: settings.inventoryPuzzles.enabled,
      inventoryPuzzlesText: settings.inventoryPuzzles.additionalText,
      npcs: settings.npcs.enabled,
      npcsText: settings.npcs.additionalText,
      style: settings.style
    });
  };

  const handleGenerateAdventure = async () => {
    if (!settings.scenario.trim()) {
      alert('Bitte gib ein Szenario ein.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate the ChatGPT prompt
      const prompt = generatePrompt(settings);
      
      // Call the ChatGPT API directly
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('openai_api_key') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein erfahrener Textadventure-Game Master. Erstelle spannende und interaktive Abenteuer.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aufruf der ChatGPT API');
      }

      const data = await response.json();
      const adventureJson = data.choices[0].message.content;
      
      setGeneratedJson(adventureJson);
    } catch (error) {
      console.error('Error generating adventure:', error);
      
      // Fallback: Show the prompt that would be sent to ChatGPT
      const prompt = generatePrompt(settings);
      const fallbackResponse = {
        prompt: prompt,
        message: "ChatGPT API nicht verfügbar. Hier ist der Prompt, der an ChatGPT gesendet würde:",
        adventure: {
          title: `Abenteuer: ${settings.scenario}`,
          description: `Ein ${settings.difficulty.level}es Abenteuer mit ${settings.rooms.amount} Räumen.`,
          rooms: [],
          npcs: [],
          items: [],
          puzzles: [],
          initialRoom: 'start',
          prompt: prompt
        }
      };
      
      setGeneratedJson(JSON.stringify(fallbackResponse, null, 2));
      alert('ChatGPT API nicht verfügbar. Der Prompt wird angezeigt, der an ChatGPT gesendet würde.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!settings.scenario.trim()) {
      alert('Bitte gib ein Szenario ein.');
      return;
    }
    
    if (!generatedJson) {
      alert('Bitte generiere zuerst ein Abenteuer.');
      return;
    }

    onSave(settings, generatedJson);
  };

  return (
    <div className="adventure-creator">
      <div className="creator-header">
        <h2>Abenteuer erstellen</h2>
        <p>Fülle die Felder aus und lass ChatGPT ein Abenteuer für dich erstellen.</p>
      </div>

      <div className="creator-form">
        <div className="form-section">
          <h3>Grundlegende Einstellungen</h3>
          
          <div className="form-group">
            <label>Szenario (Pflicht):</label>
            <textarea
              value={settings.scenario}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                scenario: e.target.value
              }))}
              placeholder="Beschreibe das Szenario deines Abenteuers..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Schwierigkeitsgrad:</label>
            <div className="radio-group">
              {(['einfach', 'mittel', 'schwer'] as const).map(level => (
                <label key={level}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={settings.difficulty.level === level}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      difficulty: {
                        ...prev.difficulty,
                        level: e.target.value as 'einfach' | 'mittel' | 'schwer'
                      }
                    }))}
                  />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={settings.difficulty.additionalText}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                difficulty: {
                  ...prev.difficulty,
                  additionalText: e.target.value
                }
              }))}
              placeholder="Zusätzliche Anmerkungen zum Schwierigkeitsgrad"
            />
          </div>

          <div className="form-group">
            <label>Anzahl der Räume:</label>
            <div className="radio-group">
              {(['wenige', 'mittel', 'viele'] as const).map(amount => (
                <label key={amount}>
                  <input
                    type="radio"
                    name="rooms"
                    value={amount}
                    checked={settings.rooms.amount === amount}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      rooms: {
                        ...prev.rooms,
                        amount: e.target.value as 'wenige' | 'mittel' | 'viele'
                      }
                    }))}
                  />
                  {amount.charAt(0).toUpperCase() + amount.slice(1)}
                </label>
              ))}
            </div>
            <input
              type="text"
              value={settings.rooms.additionalText}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                rooms: {
                  ...prev.rooms,
                  additionalText: e.target.value
                }
              }))}
              placeholder="Zusätzliche Anmerkungen zu den Räumen"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Spielmechaniken</h3>
          
          <div className="checkbox-group">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.timeSystem.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    timeSystem: {
                      ...prev.timeSystem,
                      enabled: e.target.checked
                    }
                  }))}
                />
                Zeitsystem
              </label>
              <input
                type="text"
                value={settings.timeSystem.additionalText}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  timeSystem: {
                    ...prev.timeSystem,
                    additionalText: e.target.value
                  }
                }))}
                placeholder="Beschreibung des Zeitsystems"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.playerCanDie.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    playerCanDie: {
                      ...prev.playerCanDie,
                      enabled: e.target.checked
                    }
                  }))}
                />
                Spieler kann sterben
              </label>
              <input
                type="text"
                value={settings.playerCanDie.additionalText}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  playerCanDie: {
                    ...prev.playerCanDie,
                    additionalText: e.target.value
                  }
                }))}
                placeholder="Beschreibung der Todesmechanik"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.inventoryPuzzles.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    inventoryPuzzles: {
                      ...prev.inventoryPuzzles,
                      enabled: e.target.checked
                    }
                  }))}
                />
                Inventar-Rätsel
              </label>
              <input
                type="text"
                value={settings.inventoryPuzzles.additionalText}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  inventoryPuzzles: {
                    ...prev.inventoryPuzzles,
                    additionalText: e.target.value
                  }
                }))}
                placeholder="Beschreibung der Inventar-Rätsel"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.npcs.enabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    npcs: {
                      ...prev.npcs,
                      enabled: e.target.checked
                    }
                  }))}
                />
                NPCs
              </label>
              <input
                type="text"
                value={settings.npcs.additionalText}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  npcs: {
                    ...prev.npcs,
                    additionalText: e.target.value
                  }
                }))}
                placeholder="Beschreibung der NPCs"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Stil</h3>
          
          <div className="form-group">
            <label>Stil:</label>
            <textarea
              value={settings.style}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                style: e.target.value
              }))}
              placeholder="Beschreibe den gewünschten Stil des Abenteuers..."
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="creator-actions">
        <button 
          onClick={handleGenerateAdventure}
          disabled={isGenerating || !settings.scenario.trim()}
          className="generate-button"
        >
          {isGenerating ? 'Generiere...' : 'Abenteuer generieren'}
        </button>
        
        {generatedJson && (
          <div className="generated-preview">
            <h3>Generiertes Abenteuer</h3>
            <pre>{generatedJson}</pre>
            <button onClick={handleSave} className="save-button">
              Abenteuer speichern
            </button>
          </div>
        )}
        
        <button onClick={onCancel} className="cancel-button">
          Abbrechen
        </button>
      </div>
    </div>
  );
}; 