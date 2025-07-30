import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Adventure, ChatMessage, GameSession } from '../types';

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
      // Load the pre-generated adventure data
      const adventureData = JSON.parse(adventure.jsonData);
      
      // Send initial message with adventure exposition
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'system',
        content: `Lade Abenteuer: ${adventure.title}\n\n${adventureData.description}`,
        timestamp: new Date()
      };

      setSession(prev => ({
        ...prev,
        messages: [initialMessage]
      }));

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show the initial room description
      const startRoom = adventureData.rooms.find((room: any) => room.id === adventureData.initialRoom);
      const expositionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Willkommen zu "${adventure.title}"!\n\n${startRoom.description}\n\nDu kannst mit der Umgebung interagieren, Gegenstände sammeln und kombinieren, und mit NPCs sprechen.\n\nVerwende natürliche Sprache, um zu beschreiben, was du tun möchtest. Du kannst zum Beispiel sagen:\n- "Ich schaue mich um"\n- "Ich nehme den Schlüssel"\n- "Ich spreche mit dem NPC"\n- "Ich gehe nach Norden"\n\nWas möchtest du tun?`,
        timestamp: new Date(),
        roomId: adventureData.initialRoom
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, expositionMessage],
        currentRoom: adventureData.initialRoom
      }));
      setCurrentRoom(adventureData.initialRoom);
      
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
  }, [adventure.id, adventure.title, adventure.jsonData]);

  // Initialize the game when component mounts
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
      // Send message to ChatGPT API directly
      const adventureContext = `
Aktuelles Abenteuer: ${JSON.stringify(JSON.parse(adventure.jsonData), null, 2)}
Aktueller Raum: ${currentRoom}
Inventar: ${session.inventory ? session.inventory.join(', ') : 'Leer'}
Variablen: ${JSON.stringify(session.variables || {})}

Spieler-Eingabe: ${content}

Antworte als der Abenteuer-Game Master. Berücksichtige den aktuellen Raum, das Inventar und die Spieler-Eingabe. Gib eine passende Antwort, die das Spiel voranbringt.
      `;

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
              content: adventureContext
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aufruf der ChatGPT API');
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
      
      // Fallback response
      const fallbackResponse = generateFallbackResponse(content, currentRoom);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        roomId: fallbackResponse.roomId || undefined
      };

      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        currentRoom: fallbackResponse.roomId || prev.currentRoom,
        inventory: fallbackResponse.inventory || prev.inventory,
        variables: fallbackResponse.variables || prev.variables
      }));

      if (fallbackResponse.roomId && fallbackResponse.roomId !== currentRoom) {
        setCurrentRoom(fallbackResponse.roomId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (userInput: string, currentRoom: string | null) => {
    // This is a simple fallback - in reality, this would be handled by ChatGPT
    const input = userInput.toLowerCase();
    
    if (input.includes('inventar') || input.includes('inventory')) {
      return {
        content: `Dein Inventar: ${session.inventory.length > 0 ? session.inventory.join(', ') : 'Leer'}`,
        roomId: currentRoom,
        inventory: session.inventory,
        variables: session.variables
      };
    }
    
    if (input.includes('umsehen') || input.includes('schauen')) {
      return {
        content: `Du schaust dich um. Du siehst verschiedene Objekte und Ausgänge. Was möchtest du genauer untersuchen?`,
        roomId: currentRoom,
        inventory: session.inventory,
        variables: session.variables
      };
    }
    
    if (input.includes('norden') || input.includes('north')) {
      return {
        content: `Du gehst nach Norden und betrittst einen neuen Raum. Die Umgebung verändert sich...`,
        roomId: 'room_north',
        inventory: session.inventory,
        variables: session.variables
      };
    }
    
    if (input.includes('süden') || input.includes('south')) {
      return {
        content: `Du gehst nach Süden und betrittst einen neuen Raum. Die Umgebung verändert sich...`,
        roomId: 'room_south',
        inventory: session.inventory,
        variables: session.variables
      };
    }
    
    // Default response
    return {
      content: `Du versuchst "${userInput}". Ich verstehe deine Absicht, aber ich brauche mehr Kontext. Was genau möchtest du tun?`,
      roomId: currentRoom,
      inventory: session.inventory,
      variables: session.variables
    };
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