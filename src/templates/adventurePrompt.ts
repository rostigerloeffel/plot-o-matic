export const generateAdventurePrompt = (settings: {
  scenario: string;
  seed: string;
  difficulty: string;
  difficultyText: string;
  rooms: string;
  roomsText: string;
  timeSystem: boolean;
  timeSystemText: string;
  playerCanDie: boolean;
  playerCanDieText: string;
  inventoryPuzzles: boolean;
  inventoryPuzzlesText: string;
  npcs: boolean;
  npcsText: string;
  style: string;
}) => {
  const {
    scenario,
    seed,
    difficulty,
    difficultyText,
    rooms,
    roomsText,
    timeSystem,
    timeSystemText,
    playerCanDie,
    playerCanDieText,
    inventoryPuzzles,
    inventoryPuzzlesText,
    npcs,
    npcsText,
    style
  } = settings;

  return `Erstelle ein Text-Adventure. Die Merkmale:
- SZENARIO: ${scenario}
- SEED: ${seed}
- SCHWIERIGKEITSGRAD: ${difficulty} ${difficultyText}
- RÄUME: ${rooms} ${roomsText}
- ZEITSYSTEM: ${timeSystem ? 'ja' : 'nein'} ${timeSystemText}
- SPIELER KANN STERBEN: ${playerCanDie ? 'ja' : 'nein'} ${playerCanDieText}
- INVENTAR-RÄTSEL: ${inventoryPuzzles ? 'ja' : 'nein'} ${inventoryPuzzlesText}
- NPCS: ${npcs ? 'ja' : 'nein'} ${npcsText}
- STIL: ${style}

Hintergrund: Denke dir eine Handlung zum gegebenen Szenario aus. Die Handlung soll simpel und nachvollziehbar sein. Das Szenario soll in sich schlüssig und konsistent sein, aber ein Mysterium beeinhalten, welches der Spieler entdecken kann. Verwende den Seed als Basis für konsistente Zufallsgenerierung und um sicherzustellen, dass das Abenteuer reproduzierbar ist.

Struktur: Das Abenteuer soll in "Räumen" organisiert werden. Der Spieler, soll verschiedene Rätsel lösen um das Abenteuer zu lösen. Denke dir Rätsel aus gemäß dem Schwierigkeitsgrad aus. Rätsel sollten einen Bezug zu den Räumen haben und können auf Interaktionen basieren, die die Spielfigur im Raum durchführen kann. Außerdem kann der Spieler Gegenstände sammeln, untersuchen und kombinieren um Rätsel zu lösen. Der Spieler befindet sich zu jedem Zeitpunkt in genau einem Raum. Beschreibe den Raum präzise und prägnant, aber nicht ausschweifend. Rätsel können sich über mehrere Räume erstrecken, achte aber unbedingt darauf, dass Rätsel auch wirklich lösbar sind - insbesondere, wenn der Spieler gewisse Räume noch gar nicht erreichen kann. NPCs und Interaktionen mit diesen können Teil des Rätsels sein. Wenn es ein Zeitsystem gibt, können die Rätsel abhängig vom Zeitfortschritt sein. Achte darauf, dass die Rätsel auch wirklich lösbar sind, auch wenn der Spieler möglicherweise einen Zeitpunkt verpasst hat.

Ablauf: Frage immer wieder, was der Spieler tun möchte. Interpretiere seine Eingabe. Die Eingaben stellen Interaktionen mit dem Raum, den gesammelten Gegenständen oder NPCs dar. Beobachte, ob der Spieler Rätsel gelöst hat und gib ihm Feedback. Gib in den Beschreibungen der Räume keine Hinweise zur Lösung der Rätsel.

Anderes: Erstelle alle Räume, alle NPCs, alle Rätsel usw. JETZTm, nicht erst während des Spiels. Generiere insbesondere schon alle Beschreibungstexte und Dialoge. Serialisiere des komplette Abenteuer als JSON und gib es mir zurück.`;
}; 