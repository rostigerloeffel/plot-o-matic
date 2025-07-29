import React, { useState, useCallback } from 'react';
import { Adventure, StoryNode, Choice } from '../types';

interface AdventureEditorProps {
  adventure?: Adventure;
  onSave: (adventure: Adventure) => void;
  onCancel: () => void;
}

export const AdventureEditor: React.FC<AdventureEditorProps> = ({ 
  adventure, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState(adventure?.title || '');
  const [description, setDescription] = useState(adventure?.description || '');
  const [author, setAuthor] = useState(adventure?.author || '');
  const [nodes, setNodes] = useState<StoryNode[]>(adventure?.nodes || []);
  const [startNodeId, setStartNodeId] = useState(adventure?.startNodeId || '');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const createNewNode = useCallback(() => {
    const newNode: StoryNode = {
      id: `node_${Date.now()}`,
      text: '',
      choices: []
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    if (!startNodeId) {
      setStartNodeId(newNode.id);
    }
  }, [startNodeId]);

  const updateNode = useCallback((nodeId: string, updates: Partial<StoryNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    if (startNodeId === nodeId) {
      setStartNodeId('');
    }
  }, [selectedNodeId, startNodeId]);

  const addChoice = useCallback((nodeId: string) => {
    const newChoice: Choice = {
      id: `choice_${Date.now()}`,
      text: '',
      nextNodeId: ''
    };
    updateNode(nodeId, {
      choices: [...(nodes.find(n => n.id === nodeId)?.choices || []), newChoice]
    });
  }, [nodes, updateNode]);

  const updateChoice = useCallback((nodeId: string, choiceId: string, updates: Partial<Choice>) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: node.choices?.map(choice =>
            choice.id === choiceId ? { ...choice, ...updates } : choice
          ) || []
        };
      }
      return node;
    }));
  }, []);

  const deleteChoice = useCallback((nodeId: string, choiceId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          choices: node.choices?.filter(choice => choice.id !== choiceId) || []
        };
      }
      return node;
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim() || !author.trim() || nodes.length === 0 || !startNodeId) {
      alert('Bitte fülle alle Pflichtfelder aus und erstelle mindestens einen Knoten.');
      return;
    }

    const adventureData: Adventure = {
      id: adventure?.id || `adventure_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      author: author.trim(),
      nodes,
      startNodeId,
      createdAt: adventure?.createdAt || new Date(),
      updatedAt: new Date()
    };

    onSave(adventureData);
  }, [title, description, author, nodes, startNodeId, adventure, onSave]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="adventure-editor">
      <div className="editor-header">
        <h2>{adventure ? 'Abenteuer bearbeiten' : 'Neues Abenteuer erstellen'}</h2>
      </div>

      <div className="editor-form">
        <div className="form-group">
          <label>Titel:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel des Abenteuers"
          />
        </div>

        <div className="form-group">
          <label>Beschreibung:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreibung des Abenteuers"
          />
        </div>

        <div className="form-group">
          <label>Autor:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Name des Autors"
          />
        </div>

        <div className="form-group">
          <label>Startknoten:</label>
          <select
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
          >
            <option value="">Wähle einen Startknoten</option>
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.text || `Knoten ${node.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="nodes-section">
        <div className="nodes-header">
          <h3>Knoten ({nodes.length})</h3>
          <button onClick={createNewNode}>Neuer Knoten</button>
        </div>

        <div className="nodes-list">
          {nodes.map(node => (
            <div key={node.id} className="node-item">
              <div className="node-header">
                <button
                  className={selectedNodeId === node.id ? 'active' : ''}
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {node.text || `Knoten ${node.id}`}
                </button>
                <button onClick={() => deleteNode(node.id)}>Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedNode && (
        <div className="node-editor">
          <h3>Knoten bearbeiten</h3>
          
          <div className="form-group">
            <label>Text:</label>
            <textarea
              value={selectedNode.text}
              onChange={(e) => updateNode(selectedNode.id, { text: e.target.value })}
              placeholder="Text des Knotens"
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={selectedNode.isEnd || false}
                onChange={(e) => updateNode(selectedNode.id, { isEnd: e.target.checked })}
              />
              Endknoten
            </label>
          </div>

          <div className="choices-section">
            <h4>Optionen ({selectedNode.choices?.length || 0})</h4>
            <button onClick={() => addChoice(selectedNode.id)}>Option hinzufügen</button>

            {selectedNode.choices?.map(choice => (
              <div key={choice.id} className="choice-item">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoice(selectedNode.id, choice.id, { text: e.target.value })}
                  placeholder="Optionstext"
                />
                <select
                  value={choice.nextNodeId}
                  onChange={(e) => updateChoice(selectedNode.id, choice.id, { nextNodeId: e.target.value })}
                >
                  <option value="">Wähle Zielknoten</option>
                  {nodes.map(node => (
                    <option key={node.id} value={node.id}>
                      {node.text || `Knoten ${node.id}`}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={choice.condition || ''}
                  onChange={(e) => updateChoice(selectedNode.id, choice.id, { condition: e.target.value })}
                  placeholder="Bedingung (optional)"
                />
                <button onClick={() => deleteChoice(selectedNode.id, choice.id)}>Löschen</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="editor-actions">
        <button onClick={handleSave}>Speichern</button>
        <button onClick={onCancel}>Abbrechen</button>
      </div>
    </div>
  );
}; 