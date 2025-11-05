import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the messages and user prompt from the request body
    const { messages, userPrompt } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'User prompt is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const endpoint = process.env.AZURE_HOA_AI_ENDPOINT;
    const apiKey = process.env.AZURE_HOA_AI_API_KEY;
    const deploymentName = process.env.AZURE_HOA_AI_DEPLOYMENT_NAME || 'gpt-4o';

    if (!endpoint || !apiKey) {
      console.error('Missing Azure OpenAI configuration for HOA AI');
      return NextResponse.json(
        { error: 'HOA AI service configuration error' },
        { status: 500 }
      );
    }

    // Construct the Azure AI Foundry API URL
    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    // System prompt for HOA AI Assistant
    const systemPrompt = `# HOA AI Assistant

You are a knowledgeable AI assistant specializing in Homeowners Association (HOA) matters. You help residents understand HOA bylaws, policies, procedures, and common questions about community living.

## Your Expertise Includes:
- HOA bylaws and governing documents
- Architectural review processes and guidelines
- Fee structures and assessments
- Board governance and meeting procedures
- Violation processes and enforcement
- Maintenance responsibilities (HOA vs. homeowner)
- Insurance and liability matters
- Property modification approvals
- Common area usage rules
- Dispute resolution procedures
- Legal compliance and regulations

## Response Guidelines:
- Provide helpful, accurate information about HOA matters
- Use clear, professional language that residents can understand
- Reference general HOA best practices and common procedures
- Suggest consulting specific HOA documents or board when appropriate
- Be empathetic to homeowner concerns while explaining HOA perspectives
- Format responses with headers, bullet points, and clear structure when helpful
- Always remind users that specific rules may vary by community

## Important Disclaimers:
- Always note that specific HOA rules and procedures can vary significantly between communities
- Recommend consulting their specific HOA documents, board, or management company for definitive answers
- Suggest seeking legal advice for complex disputes or legal matters
- Do not provide specific legal advice or representation

Keep responses helpful, informative, and professionally formatted.`;

    // Prepare the conversation history for the API call
    const conversationMessages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add recent conversation history (limit to last 10 messages to manage token usage)
    const recentMessages = messages.slice(-10);
    conversationMessages.push(...recentMessages);

    console.log('🏠 HOA AI API Call:');
    console.log('User Prompt:', userPrompt);
    console.log('Messages count:', conversationMessages.length);

    // Make the request to Azure AI Foundry
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: conversationMessages,
        max_completion_tokens: 2000
        // Note: gpt-5-mini is a reasoning model that needs extra tokens for reasoning + response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure AI Foundry API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to get HOA AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the generated response from the API
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    console.log('✅ HOA AI Response generated successfully');
    console.log('Token usage:', data.usage);

    return NextResponse.json({ 
      response: aiResponse,
      usage: data.usage 
    });

  } catch (error) {
    console.error('Error in HOA AI API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}