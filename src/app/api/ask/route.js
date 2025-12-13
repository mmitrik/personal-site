/**
 * HOA AI Assistant RAG API Route
 * 
 * This endpoint processes user questions using Retrieval-Augmented Generation (RAG).
 * It searches the HOA bylaws for relevant content and provides accurate, cited answers.
 */

import { NextResponse } from 'next/server';
import { searchDocuments } from '../../../../lib/azureSearch';

/**
 * RAG Configuration
 */
const RAG_CONFIG = {
  // Retrieval settings
  maxRetrievedChunks: 8, // Increased from 5 to get more context
  minSimilarityScore: 0.5, // Lowered from 0.7 to catch more relevant chunks
  
  // Response generation settings
  maxResponseTokens: 4000, // gpt-5-mini reasoning model: needs budget for reasoning (up to 2000) + output (500-2000)
  includeSourceCitations: true,
  
  // Content filtering
  requireBylawsContent: true,
};

/**
 * Build the system prompt with retrieved context
 * @param {Array} retrievedChunks - Relevant bylaw chunks
 * @returns {string} System prompt with context
 */
function buildSystemPrompt(retrievedChunks) {
  const contextSections = retrievedChunks.map((chunk, index) => {
    const sectionInfo = chunk.sectionNumber && chunk.sectionTitle
      ? `Section ${chunk.sectionNumber} - ${chunk.sectionTitle}`
      : `Content Chunk ${index + 1}`;
    
    return `[${sectionInfo}]
${chunk.content}`;
  }).join('\n\n');

  return `# HOA AI Assistant - Bylaws Expert

You are an expert HOA assistant that answers questions based EXCLUSIVELY on the provided HOA bylaws context. 

## CRITICAL INSTRUCTIONS:
1. **ONLY use information from the provided bylaws context below**
2. **Search carefully through ALL provided context sections for the answer**
3. **If the answer is not in the context after thorough review, respond with "I don't know" or "This information is not available in the bylaws"**
4. **Always cite specific section numbers (e.g., Article I, Section C) when referencing bylaws**
5. **Provide accurate, helpful responses in a professional tone**
6. **Do not make assumptions or provide general HOA advice not in the bylaws**
7. **For questions about names, dates, or specific details, look for exact matches in the context**

## RESPONSE FORMAT:
- Start with a direct answer to the question
- Include relevant section numbers and titles when citing
- Be concise but comprehensive
- If multiple sections apply, mention all relevant ones
- End with a note about consulting the full bylaws document for complete details

## EXAMPLE RESPONSES:
**Good:** "The Association is named 'Birchwood/Springmeadow Park Homeowners Association' (Article I, Section C)."
**Good:** "According to Article VII, Section R.1, no trailers, boats, RVs, or commercial vehicles may be parked in the subdivision except within a private attached garage."
**Avoid:** Generic answers without citing specific sections or paraphrasing when exact quotes would be better.

## HOA BYLAWS CONTEXT:
${contextSections}

## REMEMBER:
- Base your answer ONLY on the context above
- Cite section numbers when referencing specific rules
- If unsure or information is missing, clearly state "I don't know"
- Be helpful but accurate - do not invent or assume information`;
}

/**
 * Generate AI response using retrieved context
 * @param {string} userQuestion - User's question
 * @param {Array} retrievedChunks - Relevant context chunks
 * @returns {string} AI-generated response
 */
async function generateResponse(userQuestion, retrievedChunks) {
  // Check for required environment variables
  const rawEndpoint = process.env.AZURE_HOA_AI_ENDPOINT;
  const apiKey = process.env.AZURE_HOA_AI_API_KEY;
  const deploymentName = process.env.AZURE_HOA_AI_DEPLOYMENT_NAME;

  const endpoint = rawEndpoint ? rawEndpoint.replace(/\/+$/, '') : rawEndpoint;

  console.log('🔧 AI Config:', {
    endpoint,
    deploymentName: deploymentName ?? null,
    hasApiKey: !!apiKey,
  });

  if (!endpoint || !apiKey || !deploymentName) {
    throw new Error(
      'Azure HOA AI configuration missing. Ensure AZURE_HOA_AI_ENDPOINT, AZURE_HOA_AI_API_KEY, and AZURE_HOA_AI_DEPLOYMENT_NAME are set (and restart the dev server after changing .env.local).'
    );
  }

  // Build the conversation with system prompt and user question
  const systemPrompt = buildSystemPrompt(retrievedChunks);
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: userQuestion
    }
  ];

  // Construct the Azure OpenAI API URL
  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

  const requestBody = {
    messages: messages,
    max_completion_tokens: RAG_CONFIG.maxResponseTokens,
    // Note: gpt-5-mini only supports default temperature (1), so we omit it
    stream: false
  };

  console.log('🌐 API URL:', url);
  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 AI API Response data:', JSON.stringify(data, null, 2));
    console.log('🔍 Choices:', data.choices);
    console.log('🔍 First choice:', data.choices?.[0]);
    console.log('🔍 Message:', data.choices?.[0]?.message);
    console.log('🔍 Content:', data.choices?.[0]?.message?.content);
    
    const aiResponse = data.choices?.[0]?.message?.content || 
      'I apologize, but I could not generate a response. Please try again.';

    console.log('✅ RAG response generated successfully');
    console.log('📊 AI Response length:', aiResponse?.length);
    console.log('📊 Token usage:', data.usage);

    return aiResponse;

  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

/**
 * Format response with source citations
 * @param {string} aiResponse - Generated AI response
 * @param {Array} retrievedChunks - Source chunks used
 * @returns {Object} Formatted response with citations
 */
function formatResponseWithCitations(aiResponse, retrievedChunks) {
  // Extract cited sections from the AI response
  const citedSections = new Set();
  const sectionMatches = aiResponse.match(/Section\s+\d+\.\d+/g) || [];
  sectionMatches.forEach(match => {
    const sectionNum = match.replace('Section ', '');
    citedSections.add(sectionNum);
  });

  // Build source citations
  const sources = retrievedChunks
    .filter(chunk => chunk.sectionNumber && citedSections.has(chunk.sectionNumber))
    .map(chunk => ({
      sectionNumber: chunk.sectionNumber,
      sectionTitle: chunk.sectionTitle,
      content: chunk.content,
      relevanceScore: chunk.score,
    }));

  // Add fallback sources if no specific citations found
  // Show all retrieved chunks that were used for context
  if (sources.length === 0 && retrievedChunks.length > 0) {
    sources.push(...retrievedChunks
      .filter(chunk => chunk.sectionNumber)
      .map(chunk => ({
        sectionNumber: chunk.sectionNumber,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
        relevanceScore: chunk.score,
      }))
    );
  }

  return {
    response: aiResponse,
    sources: sources,
    retrievedChunks: retrievedChunks.length,
    hasRelevantContent: retrievedChunks.length > 0,
  };
}

/**
 * POST /api/ask - Process user question with RAG
 */
export async function POST(request) {
  try {
    // Parse request body
    const { question, options = {} } = await request.json();

    // Validate input
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const userQuestion = question.trim();
    console.log('🤔 Processing RAG question:', userQuestion);

    // Step 1: Retrieve relevant context from bylaws
    console.log('🔍 Searching bylaws for relevant content...');
    
    const searchOptions = {
      top: RAG_CONFIG.maxRetrievedChunks,
      threshold: RAG_CONFIG.minSimilarityScore,
      includeVectorSearch: true,
      includeTextSearch: true,
    };

    let retrievedChunks;
    try {
      retrievedChunks = await searchDocuments(userQuestion, searchOptions);
    } catch (searchError) {
      console.error('Search error:', searchError);
      
      // Handle common search errors gracefully
      if (searchError.message.includes('Index not found')) {
        return NextResponse.json({
          response: "I apologize, but the HOA bylaws database is not currently available. Please contact your HOA administrator or try again later.",
          error: "Bylaws database not initialized",
          sources: [],
          retrievedChunks: 0,
          hasRelevantContent: false,
        });
      }
      
      throw searchError;
    }

    console.log(`📚 Retrieved ${retrievedChunks.length} relevant chunks`);

    // Step 2: Check if we have relevant content
    if (retrievedChunks.length === 0) {
      const noContentResponse = {
        response: "I don't have information about that topic in the HOA bylaws. Please check the complete bylaws document or contact your HOA board for assistance with questions not covered in the bylaws.",
        sources: [],
        retrievedChunks: 0,
        hasRelevantContent: false,
      };

      return NextResponse.json(noContentResponse);
    }

    // Step 3: Generate AI response using retrieved context
    console.log('🤖 Generating AI response with bylaws context...');
    
    const aiResponse = await generateResponse(userQuestion, retrievedChunks);

    // Step 4: Format response with citations
    const formattedResponse = formatResponseWithCitations(aiResponse, retrievedChunks);

    console.log('✅ RAG processing completed successfully');
    
    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('❌ RAG API error:', error);

    // Provide user-friendly error responses
    let errorMessage = 'I apologize, but I encountered an error while processing your question. Please try again.';
    
    if (error.message.includes('configuration missing')) {
      errorMessage = 'The AI service is not properly configured. Please contact your administrator.';
    } else if (error.message.includes('AI generation failed')) {
      errorMessage = 'I had trouble generating a response. Please try rephrasing your question.';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        response: errorMessage,
        sources: [],
        retrievedChunks: 0,
        hasRelevantContent: false,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ask - Health check and system status
 */
export async function GET() {
  try {
    // Check if required environment variables are set
    const hasOpenAI = !!(process.env.AZURE_HOA_AI_ENDPOINT && process.env.AZURE_HOA_AI_API_KEY);
    const hasSearch = !!(process.env.AZURE_SEARCH_ENDPOINT && process.env.AZURE_SEARCH_KEY);
    const hoaAiDeploymentName = process.env.AZURE_HOA_AI_DEPLOYMENT_NAME || null;
    
    const status = {
      service: 'HOA AI Assistant RAG API',
      version: '1.0.0',
      status: 'operational',
      capabilities: {
        openaiIntegration: hasOpenAI,
        searchIntegration: hasSearch,
        ragEnabled: hasOpenAI && hasSearch,
      },
      config: {
        maxRetrievedChunks: RAG_CONFIG.maxRetrievedChunks,
        minSimilarityScore: RAG_CONFIG.minSimilarityScore,
        maxResponseTokens: RAG_CONFIG.maxResponseTokens,
        hoaAiDeploymentName,
      },
      endpoints: {
        ask: 'POST /api/ask',
        health: 'GET /api/ask',
      },
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json(
      { 
        service: 'HOA AI Assistant RAG API',
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}