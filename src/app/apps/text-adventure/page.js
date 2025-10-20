'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';

export default function TextAdventure() {
  const [gameHistory, setGameHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentArea, setCurrentArea] = useState('field');
  const [inventory, setInventory] = useState([]);
  const textAreaRef = useRef(null);

  // Game objects definition with behaviors
  const gameObjects = {
    // Field objects
    grass: {
      aliases: ['grass', 'grasses'],
      canTake: false,
      examine: () => "The grass is green and healthy, swaying gently in the breeze."
    },
    plants: {
      aliases: ['plants', 'plant'],
      canTake: false,
      examine: () => "Various small flowering plants grow among the grass, adding splashes of color to the field."
    },
    house: {
      aliases: ['house', 'building'],
      canTake: false,
      examine: () => "The house is small and painted white with a bright red door. It looks cozy and well-maintained."
    },
    door: {
      aliases: ['door', 'red door'],
      canTake: false,
      examine: () => "The red door appears to be unlocked. You could try entering the house."
    },
    
    // Room objects
    table: {
      aliases: ['table', 'wooden table'],
      canTake: false,
      examine: (gameState) => {
        if (!gameState.paperTaken) {
          return "It's a simple wooden table. There's a piece of paper on it with writing.";
        } else {
          return "It's a simple wooden table. The paper that was on it is no longer there.";
        }
      }
    },
    chair: {
      aliases: ['chair', 'chairs', 'wooden chair'],
      canTake: false,
      examine: () => "Two simple wooden chairs that match the table. They look comfortable enough to sit in.",
      use: () => "You sit down on one of the chairs. It's quite comfortable."
    },
    paper: {
      aliases: ['paper', 'note', 'piece of paper'],
      canTake: true,
      examine: (gameState, inventory) => {
        if (inventory.includes('paper')) {
          return "A piece of paper with writing on it. You could try reading it.";
        } else if (!gameState.paperTaken) {
          return "A piece of paper on the table with some writing on it. You could take it or try to read it.";
        } else {
          return "There's no paper here to examine.";
        }
      },
      read: (gameState) => {
        if (gameState.paperTaken || !gameState.paperTaken) {
          return {
            message: "The paper reads: 'Welcome to your new home! The key to adventure lies in exploration. Don't be afraid to examine everything around you.'",
            stateUpdate: { paperRead: true }
          };
        }
      },
      take: (gameState) => {
        if (!gameState.paperTaken) {
          return {
            message: "You take the piece of paper from the table.",
            stateUpdate: { paperTaken: true },
            addToInventory: 'paper'
          };
        } else {
          return { message: "You already have the paper." };
        }
      },
      drop: () => ({
        message: "You drop the paper.",
        stateUpdate: { paperTaken: false },
        removeFromInventory: 'paper'
      })
    }
  };

  // Game world definition
  const areas = {
    field: {
      name: 'Field',
      description: "You're standing in a large green field with grasses and other low-lying plants growing all around. A small white house with a red door is nearby.",
      connections: {
        'room': ['go to house', 'enter house', 'go to door', 'open door', 'go inside', 'go north', 'go to house', 'enter house']
      },
      objects: ['grass', 'plants', 'house', 'door']
    },
    room: {
      name: 'Room',
      description: "You're standing in the doorway to the house. The interior of the house is a single room with a table and two chairs. On the table is a piece of paper with some writing on it.",
      connections: {
        'field': ['go outside', 'leave house', 'go south', 'exit', 'go to field']
      },
      objects: ['table', 'chair', 'paper']
    }
  };

  // Game state
  const [gameState, setGameState] = useState({
    paperTaken: false,
    paperRead: false
  });

  // Initialize game
  useEffect(() => {
    addToHistory("=== WELCOME TO THE TEXT ADVENTURE ===", 'system');
    addToHistory("Type 'help' for a list of commands.", 'system');
    addToHistory("", 'system');
    describeCurrentArea();
  }, []);

  // Scroll to bottom when new content is added
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [gameHistory]);

  const addToHistory = (text, type = 'game') => {
    setGameHistory(prev => [...prev, { text, type, timestamp: Date.now() }]);
  };

  const describeCurrentArea = (areaName = currentArea) => {
    const area = areas[areaName];
    addToHistory(`--- ${area.name} ---`, 'area');
    addToHistory(area.description, 'description');
    addToHistory("", 'game');
  };

  const processCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    // Add user command to history
    addToHistory(`> ${command}`, 'user');

    // Handle help command
    if (cmd === 'help') {
      addToHistory("Available commands:", 'game');
      addToHistory("• Movement: go [direction/location], enter, exit, leave", 'game');
      addToHistory("• Interaction: look, examine [object], take [object], drop [object]", 'game');
      addToHistory("• Objects: use [object], sit on [object], read [object]", 'game');
      addToHistory("• Inventory: inventory, check inventory", 'game');
      addToHistory("• Other: help", 'game');
      addToHistory("", 'game');
      return;
    }

    // Handle inventory commands
    if (cmd === 'inventory' || cmd === 'check inventory' || cmd === 'i') {
      if (inventory.length === 0) {
        addToHistory("Your inventory is empty.", 'game');
      } else {
        addToHistory(`You are carrying: ${inventory.join(', ')}`, 'game');
      }
      addToHistory("", 'game');
      return;
    }

    // Handle look command
    if (cmd === 'look' || cmd === 'look around') {
      describeCurrentArea();
      return;
    }

    // Handle movement commands
    const area = areas[currentArea];
    let moved = false;
    
    for (const [destination, commands] of Object.entries(area.connections)) {
      if (commands.some(validCmd => cmd.includes(validCmd) || cmd === validCmd)) {
        setCurrentArea(destination);
        addToHistory(`You move to the ${areas[destination].name.toLowerCase()}.`, 'game');
        addToHistory("", 'game');
        setTimeout(() => describeCurrentArea(destination), 100);
        moved = true;
        break;
      }
    }

    if (moved) return;

    // Handle object interaction
    if (cmd.startsWith('take ') || cmd.startsWith('pick up ') || cmd.startsWith('grab ')) {
      const objectName = cmd.replace(/^(take |pick up |grab )/, '');
      handleTakeObject(objectName);
      return;
    }

    if (cmd.startsWith('drop ') || cmd.startsWith('leave ')) {
      const objectName = cmd.replace(/^(drop |leave )/, '');
      handleDropObject(objectName);
      return;
    }

    if (cmd.startsWith('examine ') || cmd.startsWith('look at ')) {
      const objectName = cmd.replace(/^(examine |look at )/, '');
      handleExamineObject(objectName);
      return;
    }

    if (cmd.startsWith('read ')) {
      const objectName = cmd.replace(/^read /, '');
      handleReadObject(objectName);
      return;
    }

    if (cmd.startsWith('use ') || cmd.startsWith('sit on ') || cmd.startsWith('sit in ')) {
      let objectName;
      if (cmd.startsWith('use ')) {
        objectName = cmd.replace(/^use /, '');
      } else if (cmd.startsWith('sit on ') || cmd.startsWith('sit in ')) {
        objectName = cmd.replace(/^sit (on|in) /, '');
      }
      handleUseObject(objectName);
      return;
    }

    // Handle sitting (general command)
    if (cmd === 'sit' && currentArea === 'room') {
      handleUseObject('chair');
      return;
    }

    // Default response for unrecognized commands
    addToHistory("I don't understand that command. Try 'help' for available commands.", 'game');
    addToHistory("", 'game');
  };

  // Helper function to find object by name or alias
  const findObject = (objectName) => {
    for (const [key, obj] of Object.entries(gameObjects)) {
      if (obj.aliases.includes(objectName.toLowerCase())) {
        return { key, ...obj };
      }
    }
    return null;
  };

  // Helper function to check if object is in current area or inventory
  const isObjectAccessible = (objectKey) => {
    const area = areas[currentArea];
    return area.objects.includes(objectKey) || inventory.includes(objectKey);
  };

  const handleTakeObject = (objectName) => {
    const obj = findObject(objectName);
    
    if (!obj) {
      addToHistory(`There is no ${objectName} here to take.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (!isObjectAccessible(obj.key)) {
      addToHistory(`There is no ${objectName} here to take.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (!obj.canTake) {
      addToHistory(`You can't take the ${objectName}.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (inventory.includes(obj.key)) {
      addToHistory(`You already have the ${objectName}.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (obj.take) {
      const result = obj.take(gameState, inventory);
      addToHistory(result.message, 'game');
      
      if (result.stateUpdate) {
        setGameState(prev => ({ ...prev, ...result.stateUpdate }));
      }
      
      if (result.addToInventory) {
        setInventory(prev => [...prev, result.addToInventory]);
      }
    } else {
      // Default take behavior
      setInventory(prev => [...prev, obj.key]);
      addToHistory(`You take the ${objectName}.`, 'game');
    }
    
    addToHistory("", 'game');
  };

  const handleDropObject = (objectName) => {
    const obj = findObject(objectName);
    
    if (!obj || !inventory.includes(obj.key)) {
      addToHistory(`You don't have a ${objectName} to drop.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (obj.drop) {
      const result = obj.drop(gameState, inventory);
      addToHistory(result.message, 'game');
      
      if (result.stateUpdate) {
        setGameState(prev => ({ ...prev, ...result.stateUpdate }));
      }
      
      if (result.removeFromInventory) {
        setInventory(prev => prev.filter(item => item !== result.removeFromInventory));
      }
    } else {
      // Default drop behavior
      setInventory(prev => prev.filter(item => item !== obj.key));
      addToHistory(`You drop the ${objectName}.`, 'game');
    }
    
    addToHistory("", 'game');
  };

  const handleExamineObject = (objectName) => {
    const obj = findObject(objectName);
    
    if (!obj) {
      addToHistory(`You don't see a ${objectName} here.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (!isObjectAccessible(obj.key)) {
      addToHistory(`You don't see a ${objectName} here.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (obj.examine) {
      const message = typeof obj.examine === 'function' ? 
        obj.examine(gameState, inventory) : obj.examine;
      addToHistory(message, 'game');
    } else {
      addToHistory(`You look at the ${objectName}, but there's nothing particularly interesting about it.`, 'game');
    }
    
    addToHistory("", 'game');
  };

  const handleReadObject = (objectName) => {
    const obj = findObject(objectName);
    
    if (!obj) {
      addToHistory(`You can't read the ${objectName}.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (!isObjectAccessible(obj.key)) {
      addToHistory(`There's no ${objectName} here to read.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (obj.read) {
      const result = obj.read(gameState, inventory);
      if (result) {
        addToHistory(result.message, 'game');
        
        if (result.stateUpdate) {
          setGameState(prev => ({ ...prev, ...result.stateUpdate }));
        }
      }
    } else {
      addToHistory(`You can't read the ${objectName}.`, 'game');
    }
    
    addToHistory("", 'game');
  };

  const handleUseObject = (objectName) => {
    const obj = findObject(objectName);
    
    if (!obj) {
      addToHistory(`You don't see a ${objectName} here.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (!isObjectAccessible(obj.key)) {
      addToHistory(`You don't see a ${objectName} here.`, 'game');
      addToHistory("", 'game');
      return;
    }

    if (obj.use) {
      const result = obj.use(gameState, inventory);
      const message = typeof result === 'string' ? result : result.message;
      addToHistory(message, 'game');
      
      if (typeof result === 'object' && result.stateUpdate) {
        setGameState(prev => ({ ...prev, ...result.stateUpdate }));
      }
    } else {
      addToHistory(`You can't use the ${objectName}.`, 'game');
    }
    
    addToHistory("", 'game');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentInput.trim()) {
      processCommand(currentInput);
      setCurrentInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />
        
        {/* Back to Home Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-muted hover:text-accent inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Game Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              📜 Text Adventure
            </h1>
            <p className="text-muted text-lg">
              A classic text-based adventure game
            </p>
          </div>

          {/* Game Console */}
          <div className="bg-black rounded-lg p-6 font-mono">
            {/* Game History */}
            <div 
              ref={textAreaRef}
              className="h-96 overflow-y-auto mb-4 text-green-400 text-sm leading-relaxed"
            >
              {gameHistory.map((entry, index) => (
                <div key={index} className={`
                  ${entry.type === 'user' ? 'text-yellow-300 font-bold' : ''}
                  ${entry.type === 'system' ? 'text-cyan-300' : ''}
                  ${entry.type === 'area' ? 'text-white font-bold text-base' : ''}
                  ${entry.type === 'description' ? 'text-green-300' : ''}
                  ${entry.type === 'game' ? 'text-green-400' : ''}
                  mb-1
                `}>
                  {entry.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-green-400 mr-2">&gt;</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-green-400 outline-none font-mono placeholder-green-600"
                placeholder="Enter your command..."
                autoFocus
              />
            </form>
          </div>

          {/* Game Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-bg p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-text mb-2">Current Location</h3>
              <p className="text-accent">{areas[currentArea].name}</p>
            </div>
            <div className="bg-bg p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-text mb-2">Inventory</h3>
              <p className="text-muted">
                {inventory.length === 0 ? 'Empty' : inventory.join(', ')}
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>🎮 How to Play:</strong> Type commands to interact with the world. 
            Try commands like &quot;look&quot;, &quot;go north&quot;, &quot;take paper&quot;, or &quot;examine table&quot;. 
            Use &quot;help&quot; for more commands.
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Text Adventure v0.01</p>
        </footer>
      </div>
    </main>
  );
}