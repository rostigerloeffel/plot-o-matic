export interface StoryNode {
  id: string;
  text: string;
  choices?: Choice[];
  isEnd?: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextNodeId: string;
  condition?: string;
}

export interface StoryLine {
  id: string;
  type: 'user' | 'system' | 'narrative';
  text: string;
  timestamp: Date;
}

export interface GameState {
  currentNodeId: string;
  storyLines: StoryLine[];
  inventory: string[];
  variables: Record<string, any>;
}

export interface Adventure {
  id: string;
  title: string;
  description: string;
  author: string;
  nodes: StoryNode[];
  startNodeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewMode = 'play' | 'edit' | 'create'; 