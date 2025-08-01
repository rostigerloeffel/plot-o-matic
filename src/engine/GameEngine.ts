import { AdventureSchema, RoomSchema, ItemSchema, NPCSchema, PuzzleSchema } from '../schemas/adventureSchema';

export class GameEngine {
  private adventure: AdventureSchema;
  private gameState: AdventureSchema['gameState'];
  private currentRoom: RoomSchema;

  constructor(adventureJson: string) {
    try {
      this.adventure = JSON.parse(adventureJson);
      this.gameState = { ...this.adventure.gameState };
      this.currentRoom = this.adventure.rooms[this.gameState.currentRoom];
    } catch (error) {
      throw new Error('Invalid adventure JSON format');
    }
  }

  public getCurrentRoom(): RoomSchema {
    return this.currentRoom;
  }

  public getGameState() {
    return this.gameState;
  }

  public getAdventure() {
    return this.adventure;
  }

  public executeCommand(command: string): string {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check aliases first
    if (this.adventure.commands.aliases[normalizedCommand]) {
      return this.executeCommand(this.adventure.commands.aliases[normalizedCommand]);
    }

    // Parse command
    const parts = normalizedCommand.split(' ');
    const verb = parts[0];
    const target = parts.slice(1).join(' ');

    switch (verb) {
      case 'gehe':
        return this.handleMovement(target);
      case 'schaue':
        return this.handleLook(target);
      case 'nimm':
        return this.handleTake(target);
      case 'benutze':
        return this.handleUse(target);
      case 'sprich':
        return this.handleTalk(target);
      case 'inventar':
        return this.handleInventory();
      case 'hilfe':
        return this.handleHelp();
      default:
        return this.adventure.commands.defaultResponses.unknown_command;
    }
  }

  private handleMovement(target: string): string {
    if (!target) {
      return 'Wohin möchtest du gehen?';
    }

    // Check if target is a direction
    const direction = this.getDirection(target);
    if (direction && this.currentRoom.exits[direction]) {
      const exit = this.currentRoom.exits[direction];
      
      if (exit.isLocked) {
        if (exit.requiredItems && exit.requiredItems.length > 0) {
          const missingItems = exit.requiredItems.filter(item => !this.gameState.inventory.includes(item));
          if (missingItems.length > 0) {
            return `Der Weg ist versperrt. Du brauchst: ${missingItems.join(', ')}`;
          }
        }
        if (exit.requiredPuzzles && exit.requiredPuzzles.length > 0) {
          const unsolvedPuzzles = exit.requiredPuzzles.filter(puzzle => !this.gameState.completedPuzzles.includes(puzzle));
          if (unsolvedPuzzles.length > 0) {
            return `Der Weg ist versperrt. Du musst zuerst ein Rätsel lösen.`;
          }
        }
        return exit.message || 'Der Weg ist versperrt.';
      }

      // Move to new room
      const newRoomId = exit.targetRoom;
      if (!this.adventure.rooms[newRoomId]) {
        return 'Dieser Raum existiert nicht.';
      }

      this.gameState.currentRoom = newRoomId;
      this.currentRoom = this.adventure.rooms[newRoomId];
      
      if (!this.gameState.visitedRooms.includes(newRoomId)) {
        this.gameState.visitedRooms.push(newRoomId);
      }

      // Check for events
      const eventResult = this.checkEvents('enter_room', newRoomId);
      
      return `${this.currentRoom.longDescription}\n\n${eventResult}`;
    }

    return this.adventure.commands.defaultResponses.cant_go;
  }

  private handleLook(target: string): string {
    if (!target || target === 'um') {
      let description = this.currentRoom.longDescription;
      
      // Add visible items
      const visibleItems = this.currentRoom.items
        .filter(itemId => this.adventure.items[itemId]?.isVisible)
        .map(itemId => this.adventure.items[itemId].name);
      
      if (visibleItems.length > 0) {
        description += `\n\nDu siehst: ${visibleItems.join(', ')}`;
      }

      // Add visible NPCs
      const visibleNPCs = this.currentRoom.npcs
        .filter(npcId => this.adventure.npcs[npcId]?.isAlive)
        .map(npcId => this.adventure.npcs[npcId].name);
      
      if (visibleNPCs.length > 0) {
        description += `\n\nHier ist: ${visibleNPCs.join(', ')}`;
      }

      // Add visible puzzles
      const visiblePuzzles = this.currentRoom.puzzles
        .filter(puzzleId => this.adventure.puzzles[puzzleId]?.isVisible)
        .map(puzzleId => this.adventure.puzzles[puzzleId].name);
      
      if (visiblePuzzles.length > 0) {
        description += `\n\nDu bemerkst: ${visiblePuzzles.join(', ')}`;
      }

      return description;
    }

    // Look at specific item
    const item = this.findItem(target);
    if (item) {
      return item.longDescription;
    }

    // Look at specific NPC
    const npc = this.findNPC(target);
    if (npc) {
      return npc.description;
    }

    // Look at specific puzzle
    const puzzle = this.findPuzzle(target);
    if (puzzle) {
      return puzzle.description;
    }

    return 'Das findest du hier nicht.';
  }

  private handleTake(target: string): string {
    if (!target) {
      return 'Was möchtest du aufheben?';
    }

    const item = this.findItem(target);
    if (!item) {
      return this.adventure.commands.defaultResponses.item_not_found;
    }

    if (!item.isTakeable) {
      return this.adventure.commands.defaultResponses.item_not_takeable;
    }

    if (this.gameState.inventory.includes(item.id)) {
      return 'Du hast das bereits.';
    }

    this.gameState.inventory.push(item.id);
    return `Du hast ${item.name} aufgehoben.`;
  }

  private handleUse(target: string): string {
    if (!target) {
      return 'Was möchtest du benutzen?';
    }

    const item = this.findItem(target);
    if (!item) {
      return this.adventure.commands.defaultResponses.item_not_found;
    }

    if (!item.isUsable) {
      return this.adventure.commands.defaultResponses.item_not_usable;
    }

    if (!this.gameState.inventory.includes(item.id)) {
      return 'Du hast das nicht dabei.';
    }

    // Apply item effects
    if (item.effects) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'unlock':
            // Unlock room or exit
            break;
          case 'teleport':
            if (effect.target) {
              this.gameState.currentRoom = effect.target;
              this.currentRoom = this.adventure.rooms[effect.target];
            }
            break;
        }
      }
    }

    return `Du benutzt ${item.name}.`;
  }

  private handleTalk(target: string): string {
    if (!target) {
      return 'Mit wem möchtest du sprechen?';
    }

    const npc = this.findNPC(target);
    if (!npc) {
      return this.adventure.commands.defaultResponses.npc_not_found;
    }

    if (!npc.isAlive) {
      return 'Diese Person ist nicht mehr am Leben.';
    }

    // Start dialogue
    const startNode = npc.dialogue['start'];
    if (startNode) {
      return startNode.text;
    }

    return `${npc.name} hat nichts zu sagen.`;
  }

  private handleInventory(): string {
    if (this.gameState.inventory.length === 0) {
      return 'Dein Inventar ist leer.';
    }

    const items = this.gameState.inventory.map(itemId => this.adventure.items[itemId].name);
    return `Du hast dabei: ${items.join(', ')}`;
  }

  private handleHelp(): string {
    const verbs = Object.entries(this.adventure.commands.verbs)
      .map(([verb, def]) => `${verb}: ${def.description}`)
      .join('\n');
    
    return `Verfügbare Befehle:\n${verbs}`;
  }

  private getDirection(target: string): string | null {
    const directions: Record<string, string> = {
      'norden': 'norden',
      'nord': 'norden',
      'n': 'norden',
      'süden': 'süden',
      'süd': 'süden',
      's': 'süden',
      'osten': 'osten',
      'ost': 'osten',
      'o': 'osten',
      'westen': 'westen',
      'west': 'westen',
      'w': 'westen'
    };

    return directions[target] || null;
  }

  private findItem(target: string): ItemSchema | null {
    // Check current room items
    for (const itemId of this.currentRoom.items) {
      const item = this.adventure.items[itemId];
      if (item && item.name.toLowerCase().includes(target.toLowerCase())) {
        return item;
      }
    }

    // Check inventory
    for (const itemId of this.gameState.inventory) {
      const item = this.adventure.items[itemId];
      if (item && item.name.toLowerCase().includes(target.toLowerCase())) {
        return item;
      }
    }

    return null;
  }

  private findNPC(target: string): NPCSchema | null {
    for (const npcId of this.currentRoom.npcs) {
      const npc = this.adventure.npcs[npcId];
      if (npc && npc.name.toLowerCase().includes(target.toLowerCase())) {
        return npc;
      }
    }
    return null;
  }

  private findPuzzle(target: string): PuzzleSchema | null {
    for (const puzzleId of this.currentRoom.puzzles) {
      const puzzle = this.adventure.puzzles[puzzleId];
      if (puzzle && puzzle.name.toLowerCase().includes(target.toLowerCase())) {
        return puzzle;
      }
    }
    return null;
  }

  private checkEvents(triggerType: string, target: string): string {
    let result = '';
    
    for (const eventId of this.currentRoom.events) {
      const event = this.adventure.events[eventId];
      if (event && !event.hasTriggered && event.trigger.type === triggerType && event.trigger.target === target) {
        for (const action of event.actions) {
          switch (action.type) {
            case 'message':
              result += action.message + '\n';
              break;
            case 'give_item':
              if (!this.gameState.inventory.includes(action.target)) {
                this.gameState.inventory.push(action.target);
                result += `Du erhältst ${this.adventure.items[action.target].name}.\n`;
              }
              break;
            case 'teleport':
              this.gameState.currentRoom = action.target;
              this.currentRoom = this.adventure.rooms[action.target];
              result += 'Du wirst teleportiert.\n';
              break;
          }
        }
        event.hasTriggered = true;
      }
    }
    
    return result.trim();
  }

  public isGameOver(): boolean {
    return this.gameState.isGameOver;
  }

  public isVictory(): boolean {
    return this.gameState.isVictory;
  }

  public getAdventureMetadata() {
    return this.adventure.metadata;
  }
} 