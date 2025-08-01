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

  return `Erstelle ein vollständig ausführbares Text-Adventure für ChatGPT. Die Merkmale:
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

WICHTIG: Du musst das Abenteuer in einem spezifischen JSON-Format serialisieren, damit ChatGPT es als Game Master ausführen kann. Das JSON enthält alle notwendigen Informationen für ChatGPT, um das Adventure zu leiten.

CHATGPT-AUSFÜHRUNGSANWEISUNGEN:
ChatGPT wird als Game Master fungieren und:
1. Den Spielzustand verwalten (inventory, visitedRooms, completedPuzzles, gameVariables)
2. Spieler-Eingaben interpretieren und entsprechende Aktionen ausführen
3. Events bei relevanten Aktionen prüfen und auslösen
4. NPC-Dialoge führen basierend auf dialogue-Nodes
5. Rätsel-Lösungen prüfen und Belohnungen vergeben
6. Atmosphärische Beschreibungen geben
7. Sieg/Niederlage-Bedingungen prüfen

JSON-SCHEMA (ChatGPT-freundlich):
{
  "metadata": {
    "title": "Titel des Abenteuers",
    "description": "Kurze Beschreibung",
    "author": "Plot-O-Matic",
    "version": "1.0",
    "seed": "${seed}",
    "difficulty": "${difficulty}",
    "createdAt": "ISO-Datum",
    "settings": {
      "scenario": "${scenario}",
      "rooms": "${rooms}",
      "timeSystem": ${timeSystem},
      "playerCanDie": ${playerCanDie},
      "inventoryPuzzles": ${inventoryPuzzles},
      "npcs": ${npcs},
      "style": "${style}"
    }
  },
  "gameState": {
    "currentRoom": "start_room_id",
    "inventory": [],
    "visitedRooms": [],
    "completedPuzzles": [],
    "gameVariables": {},
    "timeElapsed": 0,
    "isGameOver": false,
    "isVictory": false
  },
  "rooms": {
    "room_id": {
      "id": "room_id",
      "name": "Raumname",
      "description": "Kurze Beschreibung",
      "longDescription": "Detaillierte atmosphärische Beschreibung für ChatGPT",
      "exits": {
        "norden": {
          "targetRoom": "target_room_id",
          "description": "Ausgang nach Norden",
          "isLocked": false,
          "requiredItems": [],
          "requiredPuzzles": []
        }
      },
      "items": ["item_id"],
      "npcs": ["npc_id"],
      "puzzles": ["puzzle_id"],
      "events": ["event_id"],
      "isLocked": false,
      "requiredItems": [],
      "requiredPuzzles": []
    }
  },
  "items": {
    "item_id": {
      "id": "item_id",
      "name": "Gegenstandsname",
      "description": "Kurze Beschreibung",
      "longDescription": "Detaillierte Beschreibung für ChatGPT",
      "isTakeable": true,
      "isUsable": true,
      "isCombinable": false,
      "location": "room_id",
      "isVisible": true,
      "isLocked": false,
      "effects": [],
      "combinations": []
    }
  },
  "npcs": {
    "npc_id": {
      "id": "npc_id",
      "name": "NPC-Name",
      "description": "Beschreibung",
      "personality": "Detaillierte Persönlichkeit für ChatGPT",
      "location": "room_id",
      "isAlive": true,
      "isFriendly": true,
      "dialogue": {
        "start": {
          "id": "start",
          "text": "Dialog-Text für ChatGPT",
          "responses": [
            {
              "text": "Antwort-Option",
              "nextNode": "next_node_id",
              "effects": []
            }
          ]
        }
      },
      "reactions": []
    }
  },
  "puzzles": {
    "puzzle_id": {
      "id": "puzzle_id",
      "name": "Rätselname",
      "description": "Beschreibung für ChatGPT",
      "type": "inventory|logic|pattern|sequence|combination|timing",
      "difficulty": "easy|medium|hard",
      "isSolved": false,
      "isVisible": true,
      "location": "room_id",
      "requiredItems": [],
      "requiredPuzzles": [],
      "solution": {
        "type": "exact|pattern|sequence|combination|timing",
        "value": "Lösungswert"
      },
      "hints": ["Hinweis 1", "Hinweis 2"],
      "reward": {
        "type": "item|unlock|variable|teleport",
        "value": "reward_value",
        "message": "Belohnungsnachricht"
      }
    }
  },
  "events": {
    "event_id": {
      "id": "event_id",
      "name": "Ereignisname",
      "description": "Beschreibung für ChatGPT",
      "trigger": {
        "type": "enter_room|pickup_item|use_item|solve_puzzle|talk_npc|time_elapsed|variable_change",
        "target": "trigger_target"
      },
      "actions": [
        {
          "type": "message|teleport|give_item|take_item|unlock|lock|set_variable|damage|heal",
          "target": "action_target",
          "value": "action_value",
          "message": "Nachricht für ChatGPT"
        }
      ],
      "isOneTime": true,
      "hasTriggered": false
    }
  },
  "commands": {
    "verbs": {
      "gehe": {
        "description": "Bewege dich in eine Richtung oder zu einem Raum",
        "usage": "gehe [richtung/raum]",
        "examples": ["gehe norden", "gehe zur Küche"],
        "applicableTo": ["room"]
      },
      "schaue": {
        "description": "Betrachte etwas genauer",
        "usage": "schaue [objekt]",
        "examples": ["schaue um", "schaue Tisch"],
        "applicableTo": ["room", "item", "npc"]
      },
      "nimm": {
        "description": "Nimm einen Gegenstand auf",
        "usage": "nimm [gegenstand]",
        "examples": ["nimm Schlüssel"],
        "applicableTo": ["item"]
      },
      "benutze": {
        "description": "Benutze einen Gegenstand",
        "usage": "benutze [gegenstand]",
        "examples": ["benutze Schlüssel"],
        "applicableTo": ["item"]
      },
      "sprich": {
        "description": "Sprich mit einem NPC",
        "usage": "sprich [npc]",
        "examples": ["sprich mit Händler"],
        "applicableTo": ["npc"]
      },
      "inventar": {
        "description": "Zeige dein Inventar",
        "usage": "inventar",
        "examples": ["inventar"],
        "applicableTo": []
      },
      "hilfe": {
        "description": "Zeige verfügbare Befehle",
        "usage": "hilfe",
        "examples": ["hilfe"],
        "applicableTo": []
      }
    },
    "aliases": {
      "n": "gehe norden",
      "s": "gehe süden",
      "o": "gehe osten",
      "w": "gehe westen",
      "i": "inventar",
      "h": "hilfe"
    },
    "defaultResponses": {
      "unknown_command": "Ich verstehe nicht, was du meinst.",
      "cant_go": "Du kannst nicht in diese Richtung gehen.",
      "item_not_found": "Das findest du hier nicht.",
      "item_not_takeable": "Du kannst das nicht aufheben.",
      "item_not_usable": "Du kannst das nicht benutzen.",
      "npc_not_found": "Diese Person ist hier nicht.",
      "puzzle_not_found": "Dieses Rätsel gibt es hier nicht."
    }
  }
}

CHATGPT-AUSFÜHRUNGSREGELN:
1. Verwende die JSON-Daten als Spielwelt-Definition
2. Halte den Spielzustand aktuell (inventory, visitedRooms, completedPuzzles, gameVariables)
3. Reagiere auf Spieler-Eingaben basierend auf den verfügbaren Befehlen
4. Prüfe bei jeder Aktion die Bedingungen (requiredItems, requiredPuzzles, etc.)
5. Aktualisiere den Spielzustand entsprechend
6. Gib detaillierte, atmosphärische Beschreibungen
7. Verwende die defaultResponses für unbekannte oder unmögliche Aktionen
8. Prüfe Events bei relevanten Aktionen (enter_room, pickup_item, etc.)
9. Beende das Spiel wenn isGameOver oder isVictory true ist

ANFORDERUNGEN:
1. Erstelle mindestens 3-5 Räume je nach Schwierigkeitsgrad
2. Jeder Raum muss eine eindeutige ID haben (z.B. "kueche", "flur", "keller")
3. Erstelle 2-4 Gegenstände, die der Spieler finden und benutzen kann
4. Erstelle 1-3 Rätsel je nach Schwierigkeitsgrad
5. Erstelle 1-2 NPCs falls aktiviert
6. Erstelle 1-3 Events für dynamische Interaktionen
7. Alle IDs müssen eindeutig sein und nur Kleinbuchstaben, Zahlen und Unterstriche enthalten
8. Der erste Raum muss "start" als ID haben
9. Alle Beschreibungen müssen auf Deutsch sein und für ChatGPT verständlich
10. Rätsel müssen lösbar sein und klare Hinweise haben
11. NPCs müssen vollständige Dialogbäume haben
12. Events müssen sinnvolle Trigger und Aktionen haben
13. Alle Beschreibungen müssen detailliert genug sein, damit ChatGPT sie verwenden kann

Gib mir nur das JSON zurück, keine zusätzlichen Erklärungen oder Kommentare.`;
}; 