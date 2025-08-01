export interface AdventureSchema {
  metadata: {
    title: string;
    description: string;
    author: string;
    version: string;
    seed: string;
    difficulty: string;
    createdAt: string;
    settings: {
      scenario: string;
      rooms: string;
      timeSystem: boolean;
      playerCanDie: boolean;
      inventoryPuzzles: boolean;
      npcs: boolean;
      style: string;
    };
  };
  gameState: {
    currentRoom: string;
    inventory: string[];
    visitedRooms: string[];
    completedPuzzles: string[];
    gameVariables: Record<string, any>;
    timeElapsed?: number;
    isGameOver: boolean;
    isVictory: boolean;
  };
  rooms: Record<string, RoomSchema>;
  items: Record<string, ItemSchema>;
  npcs: Record<string, NPCSchema>;
  puzzles: Record<string, PuzzleSchema>;
  events: Record<string, EventSchema>;
  commands: CommandSchema;
}

export interface RoomSchema {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  exits: Record<string, ExitSchema>;
  items: string[];
  npcs: string[];
  puzzles: string[];
  events: string[];
  isLocked: boolean;
  requiredItems?: string[];
  requiredPuzzles?: string[];
  ambientSounds?: string;
  lighting?: 'bright' | 'dim' | 'dark';
  temperature?: 'hot' | 'warm' | 'cold';
}

export interface ExitSchema {
  targetRoom: string;
  description: string;
  isLocked: boolean;
  requiredItems?: string[];
  requiredPuzzles?: string[];
  condition?: string;
  message?: string;
}

export interface ItemSchema {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  isTakeable: boolean;
  isUsable: boolean;
  isCombinable: boolean;
  weight?: number;
  value?: number;
  effects?: ItemEffect[];
  combinations?: ItemCombination[];
  location: string;
  isVisible: boolean;
  isLocked: boolean;
  requiredItems?: string[];
}

export interface ItemEffect {
  type: 'heal' | 'damage' | 'buff' | 'debuff' | 'teleport' | 'unlock';
  value: number;
  target?: string;
  message: string;
}

export interface ItemCombination {
  withItem: string;
  result: string;
  message: string;
  consumesItems: boolean;
}

export interface NPCSchema {
  id: string;
  name: string;
  description: string;
  personality: string;
  location: string;
  isAlive: boolean;
  isFriendly: boolean;
  dialogue: Record<string, DialogueNode>;
  quests?: string[];
  inventory?: string[];
  reactions: NPCAction[];
}

export interface DialogueNode {
  id: string;
  text: string;
  responses: DialogueResponse[];
  conditions?: DialogueCondition[];
}

export interface DialogueResponse {
  text: string;
  nextNode: string;
  effects?: NPCAction[];
  requirements?: DialogueCondition[];
}

export interface DialogueCondition {
  type: 'hasItem' | 'hasPuzzle' | 'hasVariable' | 'hasVisited';
  value: string;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
}

export interface NPCAction {
  type: 'giveItem' | 'takeItem' | 'unlockRoom' | 'unlockPuzzle' | 'setVariable' | 'teleport' | 'attack';
  target: string;
  value?: any;
  message: string;
}

export interface PuzzleSchema {
  id: string;
  name: string;
  description: string;
  type: 'inventory' | 'logic' | 'pattern' | 'sequence' | 'combination' | 'timing';
  difficulty: 'easy' | 'medium' | 'hard';
  isSolved: boolean;
  isVisible: boolean;
  location: string;
  requiredItems?: string[];
  requiredPuzzles?: string[];
  solution: PuzzleSolution;
  hints: string[];
  reward?: PuzzleReward;
  timeLimit?: number;
}

export interface PuzzleSolution {
  type: 'exact' | 'pattern' | 'sequence' | 'combination' | 'timing';
  value: string | string[] | number[];
  tolerance?: number;
}

export interface PuzzleReward {
  type: 'item' | 'unlock' | 'variable' | 'teleport';
  value: string;
  message: string;
}

export interface EventSchema {
  id: string;
  name: string;
  description: string;
  trigger: EventTrigger;
  actions: EventAction[];
  isOneTime: boolean;
  hasTriggered: boolean;
  conditions?: EventCondition[];
}

export interface EventTrigger {
  type: 'enter_room' | 'pickup_item' | 'use_item' | 'solve_puzzle' | 'talk_npc' | 'time_elapsed' | 'variable_change';
  target: string;
  value?: any;
}

export interface EventAction {
  type: 'message' | 'teleport' | 'give_item' | 'take_item' | 'unlock' | 'lock' | 'set_variable' | 'damage' | 'heal';
  target: string;
  value?: any;
  message?: string;
}

export interface EventCondition {
  type: 'has_item' | 'has_puzzle' | 'has_variable' | 'has_visited' | 'time_check';
  value: string;
  operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than';
}

export interface CommandSchema {
  verbs: Record<string, VerbDefinition>;
  aliases: Record<string, string>;
  defaultResponses: Record<string, string>;
}

export interface VerbDefinition {
  description: string;
  usage: string;
  examples: string[];
  applicableTo: ('room' | 'item' | 'npc' | 'puzzle')[];
}

// Default command verbs that should be included in every adventure
export const DEFAULT_VERBS = {
  'gehe': {
    description: 'Bewege dich in eine Richtung oder zu einem Raum',
    usage: 'gehe [richtung/raum]',
    examples: ['gehe norden', 'gehe zur Küche'],
    applicableTo: ['room']
  },
  'schaue': {
    description: 'Betrachte etwas genauer',
    usage: 'schaue [objekt]',
    examples: ['schaue um', 'schaue Tisch'],
    applicableTo: ['room', 'item', 'npc']
  },
  'nimm': {
    description: 'Nimm einen Gegenstand auf',
    usage: 'nimm [gegenstand]',
    examples: ['nimm Schlüssel'],
    applicableTo: ['item']
  },
  'benutze': {
    description: 'Benutze einen Gegenstand',
    usage: 'benutze [gegenstand]',
    examples: ['benutze Schlüssel'],
    applicableTo: ['item']
  },
  'sprich': {
    description: 'Sprich mit einem NPC',
    usage: 'sprich [npc]',
    examples: ['sprich mit Händler'],
    applicableTo: ['npc']
  },
  'inventar': {
    description: 'Zeige dein Inventar',
    usage: 'inventar',
    examples: ['inventar'],
    applicableTo: []
  },
  'hilfe': {
    description: 'Zeige verfügbare Befehle',
    usage: 'hilfe',
    examples: ['hilfe'],
    applicableTo: []
  }
};

// Instructions for ChatGPT to execute the adventure
export const CHATGPT_EXECUTION_INSTRUCTIONS = `
WICHTIGE ANWEISUNGEN FÜR DIE AUSFÜHRUNG:

1. Du bist der Game Master für dieses Text-Adventure
2. Verwende die JSON-Daten als Spielwelt-Definition
3. Halte den Spielzustand aktuell (inventory, visitedRooms, completedPuzzles, etc.)
4. Reagiere auf Spieler-Eingaben basierend auf den verfügbaren Befehlen
5. Prüfe bei jeder Aktion die Bedingungen (requiredItems, requiredPuzzles, etc.)
6. Aktualisiere den Spielzustand entsprechend (inventory, gameVariables, etc.)
7. Gib detaillierte, atmosphärische Beschreibungen
8. Verwende die defaultResponses für unbekannte oder unmögliche Aktionen
9. Prüfe Events bei relevanten Aktionen (enter_room, pickup_item, etc.)
10. Beende das Spiel wenn isGameOver oder isVictory true ist

SPIELER-EINGABEN INTERPRETIEREN:
- Normalisiere Eingaben (lowercase, trim)
- Prüfe Aliase (n -> gehe norden, etc.)
- Parse Verb und Target aus der Eingabe
- Führe entsprechende Aktion aus
- Gib detaillierte Rückmeldung

ZUSTANDSVERWALTUNG:
- Aktualisiere currentRoom bei Bewegung
- Füge Items zu inventory hinzu/entferne sie
- Markiere Räume als visited
- Markiere Puzzles als completed
- Setze gameVariables bei Events
- Prüfe Sieg/Niederlage-Bedingungen

EVENT-SYSTEM:
- Prüfe Events bei relevanten Aktionen
- Führe Event-Actions aus (message, give_item, teleport, etc.)
- Markiere Events als hasTriggered
- Prüfe Event-Conditions vor Ausführung

DIALOG-SYSTEM:
- Verwende NPC dialogue für Gespräche
- Prüfe Dialogue-Conditions
- Führe Dialogue-Effects aus
- Navigiere durch Dialogue-Nodes

RÄTSEL-SYSTEM:
- Prüfe Puzzle-Solutions bei Eingaben
- Gib Hints basierend auf difficulty
- Führe Puzzle-Rewards aus
- Markiere Puzzles als solved
`; 