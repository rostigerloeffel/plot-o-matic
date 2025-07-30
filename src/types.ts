export interface AdventureSettings {
  scenario: string;
  difficulty: {
    level: 'einfach' | 'mittel' | 'schwer';
    additionalText: string;
  };
  rooms: {
    amount: 'wenige' | 'mittel' | 'viele';
    additionalText: string;
  };
  timeSystem: {
    enabled: boolean;
    additionalText: string;
  };
  playerCanDie: {
    enabled: boolean;
    additionalText: string;
  };
  inventoryPuzzles: {
    enabled: boolean;
    additionalText: string;
  };
  npcs: {
    enabled: boolean;
    additionalText: string;
  };
  style: string;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  author: string;
  settings: AdventureSettings;
  jsonData: string; // The complete JSON adventure data from ChatGPT
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  roomId?: string; // For room-based chat organization
}

export interface GameSession {
  adventureId: string;
  messages: ChatMessage[];
  currentRoom?: string;
  inventory: string[];
  variables: Record<string, any>;
  isActive: boolean;
}

export type ViewMode = 'play' | 'create'; 