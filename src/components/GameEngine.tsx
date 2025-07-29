import React, { useState, useEffect, useCallback } from 'react';
import { GameState, StoryNode, StoryLine, Adventure } from '../types';

interface GameEngineProps {
  adventure: Adventure;
  onGameEnd?: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ adventure, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentNodeId: adventure.startNodeId,
    storyLines: [],
    inventory: [],
    variables: {}
  });

  const [userInput, setUserInput] = useState('');
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);

  const addStoryLine = useCallback((type: 'user' | 'system' | 'narrative', text: string) => {
    const newLine: StoryLine = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date()
    };
    setGameState(prev => ({
      ...prev,
      storyLines: [...prev.storyLines, newLine]
    }));
  }, []);

  // Initialize game
  useEffect(() => {
    const startNode = adventure.nodes.find(node => node.id === adventure.startNodeId);
    if (startNode) {
      setCurrentNode(startNode);
      addStoryLine('narrative', startNode.text);
    }
  }, [adventure, addStoryLine]);

  const handleChoice = useCallback((choiceId: string) => {
    if (!currentNode) return;

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    // Add user choice to story
    addStoryLine('user', choice.text);

    // Check if choice has condition
    if (choice.condition) {
      try {
        const conditionMet = eval(choice.condition);
        if (!conditionMet) {
          addStoryLine('system', 'Diese Option ist nicht verfügbar.');
          return;
        }
      } catch (error) {
        console.error('Error evaluating condition:', error);
      }
    }

    // Move to next node
    const nextNode = adventure.nodes.find(node => node.id === choice.nextNodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
      setGameState(prev => ({
        ...prev,
        currentNodeId: choice.nextNodeId
      }));
      addStoryLine('narrative', nextNode.text);

      if (nextNode.isEnd) {
        addStoryLine('system', 'Das Abenteuer ist beendet!');
        onGameEnd?.();
      }
    }
  }, [currentNode, adventure, addStoryLine, onGameEnd]);

  const handleUserInput = useCallback((input: string) => {
    if (!input.trim()) return;

    addStoryLine('user', input);
    setUserInput('');

    // Simple command processing
    const command = input.toLowerCase().trim();
    
    if (command === 'inventar' || command === 'inventory') {
      const inventoryText = gameState.inventory.length > 0 
        ? `Inventar: ${gameState.inventory.join(', ')}`
        : 'Dein Inventar ist leer.';
      addStoryLine('system', inventoryText);
    } else if (command.startsWith('setze ')) {
      const [, variable, value] = command.split(' ');
      if (variable && value) {
        setGameState(prev => ({
          ...prev,
          variables: { ...prev.variables, [variable]: value }
        }));
        addStoryLine('system', `Variable "${variable}" auf "${value}" gesetzt.`);
      }
    } else {
      addStoryLine('system', 'Ich verstehe nicht, was du meinst. Versuche eine der verfügbaren Optionen.');
    }
  }, [addStoryLine, gameState.inventory]);

  const resetGame = useCallback(() => {
    const startNode = adventure.nodes.find(node => node.id === adventure.startNodeId);
    if (startNode) {
      setCurrentNode(startNode);
      setGameState({
        currentNodeId: adventure.startNodeId,
        storyLines: [],
        inventory: [],
        variables: {}
      });
      addStoryLine('narrative', startNode.text);
    }
  }, [adventure, addStoryLine]);

  if (!currentNode) {
    return <div>Lade Abenteuer...</div>;
  }

  return (
    <div className="game-engine">
      <div className="text-adventure">
        {gameState.storyLines.map(line => (
          <div key={line.id} className={`story-line ${line.type}`}>
            {line.text}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleUserInput(userInput)}
          placeholder="Gib einen Befehl ein oder wähle eine Option..."
        />
        <button onClick={() => handleUserInput(userInput)}>Senden</button>
        <button onClick={resetGame}>Neustart</button>
      </div>

      {currentNode.choices && currentNode.choices.length > 0 && (
        <div className="choices">
          {currentNode.choices.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
              className="choice-button"
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 