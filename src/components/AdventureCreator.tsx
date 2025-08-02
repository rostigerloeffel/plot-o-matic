import React, { useState } from 'react';
import { AdventureSettings } from '../types';
import { generateAdventurePrompt } from '../templates/adventurePrompt';
import { SYSTEM_PROMPT } from '../templates/systemPrompt';
import { CURRENT_SCHEMA_VERSION } from '../schemas/adventureSchema';

// Function to generate a random 10-character alphanumeric seed
const generateRandomSeed = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface AdventureCreatorProps {
  onSave: (creatorSettings: any, creationPrompt: string, adventureData: any) => void;
  onCancel: () => void;
}

export const AdventureCreator: React.FC<AdventureCreatorProps> = ({
  onSave,
  onCancel
}) => {
  const [settings, setSettings] = useState<AdventureSettings>({
    scenario: '',
    seed: generateRandomSeed(),
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
  const [generatedAdventureData, setGeneratedAdventureData] = useState<any>(null);
  const [creationPrompt, setCreationPrompt] = useState<string>('');

  const generatePrompt = (settings: AdventureSettings): string => {
    return generateAdventurePrompt({
      scenario: settings.scenario,
      seed: settings.seed,
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

    if (!settings.seed.trim() || settings.seed.length !== 10 || !/^[A-Za-z0-9]{10}$/.test(settings.seed)) {
      alert('Bitte gib einen gültigen 10-stelligen alphanumerischen Seed ein.');
      return;
    }

    // Check if API key is configured
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey || apiKey.trim() === '') {
      alert('Bitte konfiguriere zuerst deinen ChatGPT API-Schlüssel über den Button oben rechts.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate the ChatGPT prompt
      const prompt = generatePrompt(settings);
      setCreationPrompt(prompt);
      
      // Call the ChatGPT API with streaming
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 16384,
          temperature: 0,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error.message || errorData.error}` : ''}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response body not available');
      }

      let fullContent = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                const content = parsed.choices[0].delta.content;
                fullContent += content;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
      
      // Parse the generated JSON data
      try {
        const parsedData = JSON.parse(fullContent);
        setGeneratedAdventureData(parsedData);
      } catch (parseError) {
        console.error('Error parsing generated JSON:', parseError);
        // If parsing fails, store the raw content
        setGeneratedAdventureData({ rawContent: fullContent });
      }
    } catch (error) {
      console.error('Error generating adventure:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      // Fallback: Show the prompt that would be sent to ChatGPT
      const prompt = generatePrompt(settings);
      setCreationPrompt(prompt);
      const fallbackResponse = {
        metadata: {
          title: `Abenteuer: ${settings.scenario}`,
          description: `Ein ${settings.difficulty.level}es Abenteuer mit ${settings.rooms.amount} Räumen.`,
          author: "Plot-O-Matic",
          version: "1.0",
          schemaVersion: CURRENT_SCHEMA_VERSION,
          createdAt: new Date().toISOString(),
          settings: {
            scenario: settings.scenario,
            rooms: settings.rooms.amount,
            timeSystem: settings.timeSystem.enabled,
            playerCanDie: settings.playerCanDie.enabled,
            inventoryPuzzles: settings.inventoryPuzzles.enabled,
            npcs: settings.npcs.enabled,
            style: settings.style
          }
        },
        gameState: {
          currentRoom: "start",
          inventory: [],
          visitedRooms: [],
          completedPuzzles: [],
          gameVariables: {},
          isGameOver: false,
          isVictory: false
        },
        rooms: {},
        items: {},
        npcs: {},
        puzzles: {},
        events: {},
        commands: {
          verbs: {},
          aliases: {},
          defaultResponses: {}
        }
      };
      
      setGeneratedAdventureData(fallbackResponse);
      alert(`ChatGPT API nicht verfügbar: ${errorMessage}\n\nEin Fallback-Abenteuer wurde erstellt.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!settings.scenario.trim()) {
      alert('Bitte gib ein Szenario ein.');
      return;
    }

    if (!settings.seed.trim() || settings.seed.length !== 10 || !/^[A-Za-z0-9]{10}$/.test(settings.seed)) {
      alert('Bitte gib einen gültigen 10-stelligen alphanumerischen Seed ein.');
      return;
    }
    
    if (!generatedAdventureData) {
      alert('Bitte generiere zuerst ein Abenteuer.');
      return;
    }

    // Convert settings to the simplified format
    const creatorSettings = {
      scenario: settings.scenario,
      seed: settings.seed,
      difficulty: settings.difficulty.level,
      rooms: settings.rooms.amount,
      timeSystem: settings.timeSystem.enabled,
      playerCanDie: settings.playerCanDie.enabled,
      inventoryPuzzles: settings.inventoryPuzzles.enabled,
      npcs: settings.npcs.enabled,
      style: settings.style
    };

    onSave(creatorSettings, creationPrompt, generatedAdventureData);
  };

  const handleDownload = () => {
    if (!generatedAdventureData) {
      alert('Bitte generiere zuerst ein Abenteuer.');
      return;
    }

    try {
      // Create a filename based on the scenario
      const scenarioName = settings.scenario.trim().replace(/[^a-zA-Z0-9äöüßÄÖÜ\s]/g, '').replace(/\s+/g, '_');
      const filename = `abenteuer_${scenarioName}_${settings.seed}.json`;
      
      // Create the simplified adventure structure
      const adventureStructure = {
        metadata: {
          title: generatedAdventureData.metadata?.title || `Abenteuer: ${settings.scenario}`,
          description: generatedAdventureData.metadata?.description || `Ein ${settings.difficulty.level}es Abenteuer mit ${settings.rooms.amount} Räumen.`,
          author: "Plot-O-Matic",
          version: "1.0",
          schemaVersion: CURRENT_SCHEMA_VERSION,
          createdAt: new Date().toISOString()
        },
        creatorSettings: {
          scenario: settings.scenario,
          seed: settings.seed,
          difficulty: settings.difficulty.level,
          rooms: settings.rooms.amount,
          timeSystem: settings.timeSystem.enabled,
          playerCanDie: settings.playerCanDie.enabled,
          inventoryPuzzles: settings.inventoryPuzzles.enabled,
          npcs: settings.npcs.enabled,
          style: settings.style
        },
        creationPrompt: creationPrompt,
        adventureData: generatedAdventureData
      };
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(adventureStructure, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Fehler beim Herunterladen der Datei.');
    }
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
            <label>Seed (Pflicht):</label>
            <div className="seed-input-group">
              <input
                type="text"
                value={settings.seed}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  seed: e.target.value
                }))}
                placeholder="10-stelliger alphanumerischer String"
                maxLength={10}
                pattern="[A-Za-z0-9]{10}"
                title="Bitte gib einen 10-stelligen alphanumerischen String ein"
              />
              <button
                type="button"
                onClick={() => setSettings(prev => ({
                  ...prev,
                  seed: generateRandomSeed()
                }))}
                className="generate-seed-button"
              >
                Neuer Seed
              </button>
            </div>
            <small>Der Seed wird für konsistente Zufallsgenerierung verwendet und macht das Abenteuer reproduzierbar.</small>
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
        
        {generatedAdventureData && (
          <div className="generated-preview">
            <h3>Generiertes Abenteuer</h3>
            <div className="adventure-summary">
              <div className="adventure-title">
                <h4>{generatedAdventureData.metadata?.title || 'Unbekanntes Abenteuer'}</h4>
              </div>
              <div className="adventure-description">
                <p>{generatedAdventureData.metadata?.description || 'Keine Beschreibung verfügbar.'}</p>
              </div>
              <div className="adventure-details">
                <p><strong>Schwierigkeit:</strong> {generatedAdventureData.metadata?.settings?.difficulty || 'Unbekannt'}</p>
                <p><strong>Räume:</strong> {Object.keys(generatedAdventureData.rooms || {}).length}</p>
                <p><strong>Gegenstände:</strong> {Object.keys(generatedAdventureData.items || {}).length}</p>
                {generatedAdventureData.metadata?.settings?.npcs && (
                  <p><strong>NPCs:</strong> {Object.keys(generatedAdventureData.npcs || {}).length}</p>
                )}
                <p><strong>Rätsel:</strong> {Object.keys(generatedAdventureData.puzzles || {}).length}</p>
              </div>
              <div className="action-buttons">
                <button onClick={handleSave} className="save-button">
                  Abenteuer speichern
                </button>
                <button onClick={handleDownload} className="download-button">
                  JSON herunterladen
                </button>
              </div>
            </div>
          </div>
        )}
        
        <button onClick={onCancel} className="cancel-button">
          Abbrechen
        </button>
      </div>
    </div>
  );
}; 