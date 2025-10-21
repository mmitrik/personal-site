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
    mailbox: {
      aliases: ['mailbox', 'mail box', 'box'],
      canTake: false,
      examine: (gameState) => {
        if (!gameState.mailboxOpened) {
          return "A white mailbox stands near the house. It appears to be closed.";
        } else if (!gameState.paperTaken) {
          return "The mailbox is open. There's a piece of paper inside.";
        } else {
          return "The mailbox is open and empty.";
        }
      },
      use: (gameState) => {
        if (!gameState.mailboxOpened) {
          return {
            message: "You open the mailbox and find a piece of paper inside.",
            stateUpdate: { mailboxOpened: true }
          };
        } else {
          return "The mailbox is already open.";
        }
      }
    },
    
    // Kitchen objects (renamed from Room)
    table: {
      aliases: ['table', 'wooden table'],
      canTake: false,
      examine: (gameState) => {
        if (!gameState.mapTaken) {
          return "It's a simple wooden table. There's a map spread out on it.";
        } else {
          return "It's a simple wooden table. The map that was on it is no longer there.";
        }
      }
    },
    chair: {
      aliases: ['chair', 'chairs', 'wooden chair'],
      canTake: false,
      examine: () => "Two simple wooden chairs that match the table. They look comfortable enough to sit in.",
      use: () => "You sit down on one of the chairs. It's quite comfortable."
    },
    map: {
      aliases: ['map', 'paper map'],
      canTake: true,
      examine: () => "A detailed map showing the house in a field. To the west of the house is a dense forest. Beyond the forest appears to be a stream, and across the stream is marked with an X.",
      read: () => "The map shows the house in the field. To the west of the house is a forest. Beyond the forest there appears to be a stream. Across the stream is an X.",
      take: (gameState) => {
        if (!gameState.mapTaken) {
          return {
            message: "You take the map from the table.",
            stateUpdate: { mapTaken: true },
            addToInventory: 'map'
          };
        } else {
          return { message: "You already have the map." };
        }
      },
      drop: () => ({
        message: "You drop the map.",
        stateUpdate: { mapTaken: false },
        removeFromInventory: 'map'
      })
    },
    paper: {
      aliases: ['paper', 'note', 'piece of paper'],
      canTake: true,
      examine: (gameState, inventory) => {
        if (inventory.includes('paper')) {
          return "A piece of paper with writing on it. You could try reading it.";
        } else if (gameState.mailboxOpened && !gameState.paperTaken) {
          return "A piece of paper from the mailbox with some writing on it. You could take it or try to read it.";
        } else {
          return "There's no paper here to examine.";
        }
      },
      read: () => ({
        message: "The paper reads: 'Welcome to your new home! The key to adventure lies in exploration. Don't be afraid to examine everything around you.'",
        stateUpdate: { paperRead: true }
      }),
      take: (gameState) => {
        if (gameState.mailboxOpened && !gameState.paperTaken) {
          return {
            message: "You take the piece of paper from the mailbox.",
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
    },
    
    // Bedroom objects
    bed: {
      aliases: ['bed', 'bedroom bed'],
      canTake: false,
      examine: () => "A comfortable-looking bed with neatly made sheets and a soft pillow.",
      use: () => "You lie down on the bed for a moment. It's very comfortable, but you have exploring to do."
    },
    nightstand: {
      aliases: ['nightstand', 'bedside table', 'table'],
      canTake: false,
      examine: (gameState) => {
        const items = [];
        if (!gameState.knifeTaken) items.push("a knife");
        if (!gameState.keyTaken) items.push("a key");
        
        if (items.length === 0) {
          return "A small wooden nightstand beside the bed. It's now empty.";
        } else if (items.length === 1) {
          return `A small wooden nightstand beside the bed. On it is ${items[0]}.`;
        } else {
          return `A small wooden nightstand beside the bed. On it are ${items.join(" and ")}.`;
        }
      }
    },
    knife: {
      aliases: ['knife', 'blade'],
      canTake: true,
      examine: () => "A sharp kitchen knife with a wooden handle. It looks well-maintained and useful.",
      take: (gameState) => {
        if (!gameState.knifeTaken) {
          return {
            message: "You take the knife from the nightstand.",
            stateUpdate: { knifeTaken: true },
            addToInventory: 'knife'
          };
        } else {
          return { message: "You already have the knife." };
        }
      },
      drop: () => ({
        message: "You drop the knife.",
        stateUpdate: { knifeTaken: false },
        removeFromInventory: 'knife'
      })
    },
    key: {
      aliases: ['key', 'small key'],
      canTake: true,
      examine: () => "A small brass key. It looks like it might unlock something important.",
      take: (gameState) => {
        if (!gameState.keyTaken) {
          return {
            message: "You take the key from the nightstand.",
            stateUpdate: { keyTaken: true },
            addToInventory: 'key'
          };
        } else {
          return { message: "You already have the key." };
        }
      },
      drop: () => ({
        message: "You drop the key.",
        stateUpdate: { keyTaken: false },
        removeFromInventory: 'key'
      }),
      use: (gameState, inventory) => {
        if (gameState.trunkFound && !gameState.trunkUnlocked) {
          return {
            message: "You use the key to unlock the trunk. It opens with a satisfying click, revealing a crystal sphere and a small vial inside.",
            stateUpdate: { trunkUnlocked: true }
          };
        } else {
          return "There's nothing here to unlock with the key.";
        }
      }
    },
    
    // Backyard objects
    garden: {
      aliases: ['garden', 'vegetable garden', 'plants'],
      canTake: false,
      examine: (gameState) => {
        if (!gameState.shovelTaken) {
          return "A well-tended vegetable garden with rows of tomatoes, carrots, and lettuce. A shovel leans against the garden bed.";
        } else {
          return "A well-tended vegetable garden with rows of tomatoes, carrots, and lettuce.";
        }
      }
    },
    shovel: {
      aliases: ['shovel', 'spade'],
      canTake: true,
      examine: () => "A sturdy gardening shovel with a wooden handle and metal blade. Perfect for digging.",
      take: (gameState) => {
        if (!gameState.shovelTaken) {
          return {
            message: "You take the shovel from the garden.",
            stateUpdate: { shovelTaken: true },
            addToInventory: 'shovel'
          };
        } else {
          return { message: "You already have the shovel." };
        }
      },
      drop: () => ({
        message: "You drop the shovel.",
        stateUpdate: { shovelTaken: false },
        removeFromInventory: 'shovel'
      }),
      use: (gameState, inventory, currentArea) => {
        if (currentArea === 'clearing' && !gameState.trunkFound) {
          return {
            message: "You dig a hole in the clearing with the shovel. After some digging, you uncover an old wooden trunk buried in the earth!",
            stateUpdate: { trunkFound: true }
          };
        } else {
          return "You dig a small hole, but find nothing of interest.";
        }
      }
    },
    
    // Forest objects
    trees: {
      aliases: ['trees', 'tree', 'forest'],
      canTake: false,
      examine: () => "Tall oak and maple trees stretch up toward the sky, their branches swaying gently in the breeze."
    },
    birds: {
      aliases: ['birds', 'bird'],
      canTake: false,
      examine: () => "Small songbirds flit between the branches, their cheerful melodies filling the air."
    },
    signpost: {
      aliases: ['sign', 'signpost', 'post', 'wooden sign'],
      canTake: false,
      examine: () => "An old wooden signpost leans slightly to one side. The words that once marked directions have faded beyond recognition."
    },
    bridge: {
      aliases: ['bridge', 'wooden bridge', 'small bridge'],
      canTake: false,
      examine: () => "A simple wooden bridge spans the narrow stream. It looks sturdy enough to cross safely."
    },
    stream: {
      aliases: ['stream', 'water', 'creek'],
      canTake: false,
      examine: () => "Clear water flows gently over smooth rocks, creating a peaceful babbling sound."
    },
    blackstone: {
      aliases: ['stone', 'black stone', 'rock'],
      canTake: false,
      examine: () => "A small, perfectly round black stone sits in the center of the clearing. It seems oddly out of place."
    },
    trunk: {
      aliases: ['trunk', 'wooden trunk', 'chest'],
      canTake: false,
      examine: (gameState) => {
        if (!gameState.trunkFound) {
          return "There's no trunk here that you can see.";
        } else if (!gameState.trunkUnlocked) {
          return "An old wooden trunk, partially covered in dirt from being buried. It has a small brass lock that needs a key.";
        } else {
          const items = [];
          if (!gameState.crystalTaken) items.push("a crystal sphere");
          if (!gameState.vialTaken) items.push("a small vial");
          
          if (items.length === 0) {
            return "The unlocked trunk is now empty.";
          } else if (items.length === 1) {
            return `The unlocked trunk contains ${items[0]}.`;
          } else {
            return `The unlocked trunk contains ${items.join(" and ")}.`;
          }
        }
      },
      use: (gameState) => {
        if (!gameState.trunkFound) {
          return "There's no trunk here to open.";
        } else if (!gameState.trunkUnlocked) {
          return "The trunk is locked. You need a key to open it.";
        } else {
          return "The trunk is already open.";
        }
      }
    },
    crystal: {
      aliases: ['crystal', 'sphere', 'crystal sphere', 'orb'],
      canTake: true,
      examine: () => "A perfectly round, clear crystal sphere that fits in your palm. Looking through it causes the surrounding area to appear strangely distorted.",
      take: (gameState) => {
        if (gameState.trunkUnlocked && !gameState.crystalTaken) {
          return {
            message: "You carefully take the crystal sphere from the trunk.",
            stateUpdate: { crystalTaken: true },
            addToInventory: 'crystal'
          };
        } else {
          return { message: "You already have the crystal sphere." };
        }
      },
      drop: () => ({
        message: "You carefully set down the crystal sphere.",
        stateUpdate: { crystalTaken: false },
        removeFromInventory: 'crystal'
      }),
      use: () => "You hold up the crystal sphere and peer through it. The world around you appears warped and distorted, as if seen through water."
    },
    vial: {
      aliases: ['vial', 'bottle', 'green liquid', 'potion'],
      canTake: true,
      examine: () => "A small glass vial containing a translucent, green liquid. It's stoppered with a cork that fits snugly.",
      take: (gameState) => {
        if (gameState.trunkUnlocked && !gameState.vialTaken) {
          return {
            message: "You carefully take the vial from the trunk.",
            stateUpdate: { vialTaken: true },
            addToInventory: 'vial'
          };
        } else {
          return { message: "You already have the vial." };
        }
      },
      drop: () => ({
        message: "You carefully set down the vial.",
        stateUpdate: { vialTaken: false },
        removeFromInventory: 'vial'
      }),
      use: () => "You examine the vial closely. The green liquid swirls mysteriously inside, but you're not sure it's safe to drink."
    }
  };

  // Game world definition
  const areas = {
    field: {
      name: 'Field',
      description: "You're standing in a large green field with grasses and other low-lying plants growing all around. A small white house with a red door is nearby. A mailbox stands near the house.",
      connections: {
        'kitchen': ['go to house', 'enter house', 'go to door', 'open door', 'go inside', 'go north'],
        'backyard': ['go around house', 'go behind house', 'go to backyard', 'go back'],
        'forestedge': ['go west', 'go to forest', 'enter forest', 'go to woods']
      },
      objects: ['grass', 'plants', 'house', 'door', 'mailbox', 'paper']
    },
    kitchen: {
      name: 'Kitchen',
      description: "You're standing in the kitchen of the house. The room has a simple wooden table with two chairs. A map is spread out on the table. A doorway to the east leads to another room.",
      connections: {
        'field': ['go outside', 'leave house', 'go south', 'exit', 'go to field'],
        'bedroom': ['go east', 'go to bedroom', 'enter bedroom', 'go to room']
      },
      objects: ['table', 'chair', 'map']
    },
    bedroom: {
      name: 'Bedroom',
      description: "A cozy bedroom with a comfortable bed against one wall. A small nightstand sits beside the bed with a few items on it.",
      connections: {
        'kitchen': ['go west', 'go to kitchen', 'leave bedroom', 'go back']
      },
      objects: ['bed', 'nightstand', 'knife', 'key']
    },
    backyard: {
      name: 'Back Yard',
      description: "You're behind the house in a small backyard. A well-tended vegetable garden takes up most of the space, with neat rows of plants growing in the rich soil.",
      connections: {
        'field': ['go around house', 'go to front', 'go to field', 'go forward']
      },
      objects: ['garden', 'shovel']
    },
    forestedge: {
      name: 'Forest Edge',
      description: "You stand at the edge of a dense forest. Tall trees stretch up toward the sky, and you can hear birds singing among the branches. Low-growing plants carpet the forest floor. A path leads deeper into the woods to the west.",
      connections: {
        'field': ['go east', 'go back', 'go to field', 'leave forest'],
        'forestpath': ['go west', 'follow path', 'go deeper', 'enter woods']
      },
      objects: ['trees', 'plants', 'birds']
    },
    forestpath: {
      name: 'Forest Path',
      description: "You're walking along a winding path that continues westward through the dense woods. An old wooden signpost stands along the path, though the words on it are no longer readable. Birds flit between the branches overhead.",
      connections: {
        'forestedge': ['go east', 'go back', 'return'],
        'stream': ['go west', 'continue west', 'follow path']
      },
      objects: ['trees', 'plants', 'birds', 'signpost']
    },
    stream: {
      name: 'Stream Crossing',
      description: "A clear stream flows through the forest here, babbling peacefully over smooth rocks. A small wooden bridge spans the water, allowing safe passage to the other side. The path continues west across the bridge.",
      connections: {
        'forestpath': ['go east', 'go back', 'return'],
        'clearing': ['go west', 'cross bridge', 'continue west', 'cross stream']
      },
      objects: ['stream', 'bridge', 'trees']
    },
    clearing: {
      name: 'Forest Clearing',
      description: "You've entered a peaceful clearing in the heart of the forest. Sunlight filters down through the canopy above. In the center of the clearing sits a small, perfectly round black stone that seems oddly out of place in this natural setting.",
      connections: {
        'stream': ['go east', 'go back', 'return', 'cross bridge']
      },
      objects: ['blackstone', 'trees', 'trunk', 'crystal', 'vial']
    }
  };

  // Game state
  const [gameState, setGameState] = useState({
    paperTaken: false,
    paperRead: false,
    mailboxOpened: false,
    mapTaken: false,
    knifeTaken: false,
    keyTaken: false,
    shovelTaken: false,
    trunkFound: false,
    trunkUnlocked: false,
    crystalTaken: false,
    vialTaken: false
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
      addToHistory("• Actions: open [object], unlock [object], dig", 'game');
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
    if (cmd === 'sit' && currentArea === 'kitchen') {
      handleUseObject('chair');
      return;
    }

    // Handle digging commands
    if (cmd.startsWith('dig') || cmd.includes('dig hole')) {
      if (inventory.includes('shovel')) {
        const shovelObj = gameObjects.shovel;
        if (shovelObj.use) {
          const result = shovelObj.use(gameState, inventory, currentArea);
          if (typeof result === 'object' && result.stateUpdate) {
            addToHistory(result.message, 'game');
            setGameState(prev => ({ ...prev, ...result.stateUpdate }));
          } else {
            addToHistory(result, 'game');
          }
        }
      } else {
        addToHistory("You need something to dig with.", 'game');
      }
      addToHistory("", 'game');
      return;
    }

    // Handle opening commands
    if (cmd.startsWith('open ')) {
      const objectName = cmd.replace(/^open /, '');
      if (objectName === 'mailbox' || objectName === 'mail box') {
        handleUseObject('mailbox');
      } else if (objectName === 'trunk' || objectName === 'chest') {
        handleUseObject('trunk');
      } else {
        addToHistory(`You can't open the ${objectName}.`, 'game');
        addToHistory("", 'game');
      }
      return;
    }

    // Handle unlocking commands
    if (cmd.startsWith('unlock ')) {
      const objectName = cmd.replace(/^unlock /, '');
      if ((objectName === 'trunk' || objectName === 'chest') && inventory.includes('key')) {
        handleUseObject('key');
      } else if (objectName === 'trunk' || objectName === 'chest') {
        addToHistory("You need a key to unlock the trunk.", 'game');
        addToHistory("", 'game');
      } else {
        addToHistory(`You can't unlock the ${objectName}.`, 'game');
        addToHistory("", 'game');
      }
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
      const result = obj.use(gameState, inventory, currentArea);
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
          <p className="text-muted text-xs">Text Adventure v0.02</p>
        </footer>
      </div>
    </main>
  );
}