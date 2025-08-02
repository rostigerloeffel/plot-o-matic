import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Adventure, ChatMessage, GameSession } from '../types';
import { CHATGPT_EXECUTION_INSTRUCTIONS } from '../schemas/adventureSchema';

interface AdventurePlayerProps {
  adventure: Adventure;
  onBack: () => void;
}

export const AdventurePlayer: React.FC<AdventurePlayerProps> = ({
  adventure,
  onBack
}) => {
  const [session, setSession] = useState<GameSession>({
    adventureId: adventure.id,
    messages: [],
    inventory: [],
    variables: {},
    isActive: true
  });

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const initializeGame = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Use the adventure data directly from the new schema
      const adventureData = adventure.adventureData;
      
      // Send initial message with adventure exposition
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `Lade Abenteuer: ${adventure.title}\n\n${adventureData.metadata?.description || adventure.description}`,
        timestamp: new Date()
      };

      setSession(prev => ({
        ...prev,
        messages: [initialMessage]
      }));

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show the initial room description
      const startRoomId = adventureData.gameState?.currentRoom || 'start';
      const startRoom = adventureData.rooms?.[startRoomId];
      const expositionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Willkommen zu "${adventure.title}"!\n\n${startRoom?.longDescription || startRoom?.description || 'Du befindest dich in einem mysteriösen Raum.'}\n\nDu kannst mit der Umgebung interagieren, Gegenstände sammeln und kombinieren, und mit NPCs sprechen.\n\nVerwende natürliche Sprache, um zu beschreiben, was du tun möchtest. Du kannst zum Beispiel sagen:\n- "Ich schaue mich um"\n- "Ich nehme den Schlüssel"\n- "Ich spreche mit dem NPC"\n- "Ich gehe nach Norden"\n\nWas möchtest du tun?`,
        timestamp: new Date(),
        roomId: startRoomId
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, expositionMessage],
        currentRoom: startRoomId
      }));
      setCurrentRoom(startRoomId);
      
    } catch (error) {
      console.error('Error initializing game:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Fehler beim Laden des Abenteuers.',
        timestamp: new Date()
      };
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  }, [adventure.id, adventure.title, adventure.adventureData, adventure.description]);

  // Initialize the game when component mounts
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Check if API key is configured
    const apiKey = localStorage.getItem('openai_api_key');
    if (!apiKey || apiKey.trim() === '') {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Bitte konfiguriere zuerst deinen ChatGPT API-Schlüssel über den Button oben rechts.',
        timestamp: new Date()
      };
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      roomId: currentRoom || undefined
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    setUserInput('');
    setIsLoading(true);

    try {
      // Send message to ChatGPT API with the execution instructions
      const adventureContext = `
${CHATGPT_EXECUTION_INSTRUCTIONS}

ADVENTURE DATA:
${JSON.stringify(adventure.adventureData, null, 2)}

CURRENT GAME STATE:
- Current Room: ${currentRoom}
- Inventory: ${session.inventory ? session.inventory.join(', ') : 'Leer'}
- Variables: ${JSON.stringify(session.variables || {})}

PLAYER INPUT: ${content}

Antworte als der Abenteuer-Game Master basierend auf den Adventure-Daten und den Ausführungsanweisungen. Berücksichtige den aktuellen Raum, das Inventar und die Spieler-Eingabe. Gib eine passende Antwort, die das Spiel voranbringt.
      `;

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
              content: 'Du bist ein erfahrener Textadventure-Game Master. Erstelle spannende und interaktive Abenteuer.'
            },
            {
              role: 'user',
              content: adventureContext
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error.message || errorData.error}` : ''}`);
      }

      const data = await response.json();
      const chatResponse = data.choices[0].message.content;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: chatResponse,
        timestamp: new Date(),
        roomId: currentRoom || undefined
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage]
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      
      const errorChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `ChatGPT API nicht verfügbar: ${errorMessage}`,
        timestamp: new Date()
      };
      
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorChatMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(userInput);
    }
  };

  const getRooms = () => {
    const rooms = new Set<string>();
    session.messages.forEach(msg => {
      if (msg.roomId) rooms.add(msg.roomId);
    });
    return Array.from(rooms);
  };

  return (
    <div className="adventure-player">
      <div className="player-header">
        <button onClick={onBack} className="back-button">
          ← Zurück zur Bibliothek
        </button>
        <h2>{adventure.title}</h2>
        <div className="game-info">
          <span>Raum: {currentRoom || 'Unbekannt'}</span>
          <span>Inventar: {session.inventory.length} Gegenstände</span>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {session.messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-content">
                <span className="typing-indicator">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Was möchtest du tun?"
            disabled={isLoading}
            rows={3}
          />
          <button 
            onClick={() => sendMessage(userInput)}
            disabled={isLoading || !userInput.trim()}
            className="send-button"
          >
            Senden
          </button>
        </div>
      </div>

      <div className="room-navigation">
        <h3>Räume</h3>
        <div className="room-list">
          {getRooms().map(roomId => (
            <button
              key={roomId}
              className={`room-button ${currentRoom === roomId ? 'active' : ''}`}
              onClick={() => setCurrentRoom(roomId)}
            >
              {roomId === 'start' ? 'Start' : roomId.replace('room_', 'Raum ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 