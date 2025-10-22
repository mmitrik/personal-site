import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Check if required environment variables are set
    const endpoint = process.env.AZURE_OPENAI_ADVENTURER_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_ADVENTURER_KEY;
    const deploymentName = process.env.AZURE_OPENAI_ADVENTURER_DEPLOYMENT;

    if (!endpoint || !apiKey || !deploymentName) {
      console.error('Missing Azure OpenAI configuration for AI Adventurer');
      return NextResponse.json(
        { error: 'AI Adventurer service not configured' },
        { status: 500 }
      );
    }

    const { gameHistory, currentArea, inventory } = await request.json();

    console.log('🤖 AI Adventurer API Call Received');
    console.log('Current Area:', currentArea);
    console.log('Inventory:', inventory);
    console.log('Game History Length:', gameHistory?.length || 0);

    if (!gameHistory || !Array.isArray(gameHistory)) {
      return NextResponse.json(
        { error: 'Game history is required and must be an array' },
        { status: 400 }
      );
    }

    // Construct the game context from history
    const recentHistory = gameHistory
      .slice(-50) // Get last 50 entries to avoid token limits
      .map(entry => entry.text)
      .join('\n');

    console.log('📝 Recent Game History (last 10 entries):');
    console.log(recentHistory);

    const systemPrompt = `# AI Adventurer
Act as the player of a text-based, adventure game. You will be presented with descriptions of the game world which includes objects present in that world. You can act by providing commands to the game. In the game are areas to explore and objects that you can interact with.

## Playing the game
You will begin the game by being presented with the opening instructions and scene. You will respond with your first action. This action will return new information about the world. You will then provide your next action. This pattern will continue until you have explored the entire game world.

## Current Status
Current Area: ${currentArea}
Inventory: ${inventory.length > 0 ? inventory.join(', ') : 'empty'}

## Instructions
- Respond with only a single game command
- Be curious and explore thoroughly
- Try to interact with objects and examine your surroundings
- Move systematically through areas
- Keep commands simple and direct (e.g., "look around", "go north", "take key")
  - Avoid extra words like "the", "a", "an", "at"

## Getting stuck
- Seeing responses like the following can indicate you are stuck:
  - "I don't understand that command." 
  - "You don't see {object} here." 
  - "There is no {object} here...

## Troubleshooting and getting unstuck
- Try moving to a new area
- Try examining different objects
- Try using objects in your inventory
- Try returning to a previous area
- Reverse direction (west->east, enter->exit) if stuck in an area`;

    const userPrompt = `Here's the recent game output:\n\n${recentHistory}\n\nWhat is your next command?`;

    console.log('🎯 System Prompt:');
    console.log(systemPrompt);
    console.log('\n📤 User Prompt:');
    console.log(userPrompt);

    // Make request to Azure OpenAI
    const azureUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    console.log('🌐 Making API call to:', azureUrl);
    console.log('📊 Request payload preview:');
    console.log('- Deployment:', deploymentName);
    console.log('- Max tokens: 50');
    console.log('- Temperature: 0.7');
    
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
    });

    console.log('📡 API Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Azure OpenAI API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    console.log('✅ API Response received');
    console.log('📈 Token usage:', data.usage);
    console.log('🎲 Choices count:', data.choices?.length || 0);
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices in AI response');
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const aiCommand = data.choices[0].message.content.trim();
    
    console.log('🎮 AI Command Generated:', aiCommand);
    console.log('🏁 API call completed successfully');
    console.log('─'.repeat(50));

    return NextResponse.json({ 
      command: aiCommand,
      usage: data.usage 
    });

  } catch (error) {
    console.error('💥 AI Adventurer API error:', error);
    console.error('Error stack:', error.stack);
    console.log('─'.repeat(50));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}