import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the prompt from the request body
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini';

    if (!endpoint || !apiKey) {
      console.error('Missing Azure OpenAI configuration');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Construct the Azure OpenAI API URL
    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    // Make the request to Azure OpenAI
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a creative assistant helping generate innovative ideas for a personal portfolio website. Provide practical, implementable suggestions that showcase technical skills and creativity.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate idea' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the generated idea from the response
    const idea = data.choices?.[0]?.message?.content || 'No idea generated';

    return NextResponse.json({ idea });

  } catch (error) {
    console.error('Error in generate-idea API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}