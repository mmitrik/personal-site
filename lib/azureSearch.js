/**
 * Azure AI Search and OpenAI Integration Utilities
 * 
 * This module provides helper functions for embedding generation,
 * vector search, and index management using Azure services.
 */

import { SearchClient, AzureKeyCredential } from '@azure/search-documents';

/**
 * Configuration for Azure services
 */
const AZURE_CONFIG = {
  // OpenAI Embedding Configuration
  embeddingModel: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME || 'text-embedding-ada-002',
  embeddingDimensions: 1536, // text-embedding-ada-002 has 1536 dimensions
  maxEmbeddingTokens: 8192,
  
  // Search Configuration
  searchTopK: 5, // Number of top results to retrieve
  searchThreshold: 0.7, // Minimum similarity score
  
  // Index Schema
  indexName: process.env.AZURE_SEARCH_INDEX_NAME || 'hoa-bylaws-index',
};

/**
 * Initialize Azure Search Client
 * @returns {SearchClient} Configured Azure Search client
 */
export function getSearchClient() {
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const apiKey = process.env.AZURE_SEARCH_KEY;
  
  if (!endpoint || !apiKey) {
    throw new Error('Missing Azure Search configuration. Please set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY environment variables.');
  }
  
  return new SearchClient(
    endpoint,
    AZURE_CONFIG.indexName,
    new AzureKeyCredential(apiKey)
  );
}

/**
 * Generate embeddings using Azure OpenAI
 * @param {string|Array} text - Text or array of texts to embed
 * @returns {Array} Array of embedding vectors
 */
export async function generateEmbeddings(text) {
  const endpoint = process.env.AZURE_HOA_AI_ENDPOINT;
  const apiKey = process.env.AZURE_HOA_AI_API_KEY;
  
  if (!endpoint || !apiKey) {
    throw new Error('Missing Azure HOA AI configuration. Please set AZURE_HOA_AI_ENDPOINT and AZURE_HOA_AI_API_KEY environment variables.');
  }
  
  // Ensure text is an array
  const texts = Array.isArray(text) ? text : [text];
  
  // Validate input
  if (texts.some(t => !t || typeof t !== 'string')) {
    throw new Error('All inputs must be non-empty strings');
  }
  
  // Get deployment name at runtime to ensure env vars are loaded
  const deploymentName = process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME || 'text-embedding-ada-002';
  
  // Construct the Azure OpenAI API URL
  const url = `${endpoint}/openai/deployments/${deploymentName}/embeddings?api-version=2024-02-15-preview`;
  
  console.log(`🔗 Calling Azure OpenAI endpoint: ${endpoint}`);
  console.log(`📝 Using deployment: ${deploymentName}`);
  console.log(`🌐 Full URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        input: texts,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI Embeddings API error:', response.status, errorText);
      throw new Error(`Failed to generate embeddings: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract embeddings from response
    const embeddings = data.data.map(item => item.embedding);
    
    console.log(`✅ Generated ${embeddings.length} embeddings`);
    console.log(`📊 Token usage:`, data.usage);
    
    return embeddings;
    
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Create or update the search index with proper schema
 * @returns {Promise} Promise resolving when index is ready
 */
export async function createOrUpdateIndex() {
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const apiKey = process.env.AZURE_SEARCH_KEY;
  
  if (!endpoint || !apiKey) {
    throw new Error('Missing Azure Search configuration');
  }
  
  // Define the index schema
  const indexDefinition = {
    name: AZURE_CONFIG.indexName,
    fields: [
      {
        name: 'id',
        type: 'Edm.String',
        key: true,
        searchable: false,
        filterable: true,
        retrievable: true,
      },
      {
        name: 'content',
        type: 'Edm.String',
        searchable: true,
        filterable: false,
        retrievable: true,
        analyzer: 'standard.lucene',
      },
      {
        name: 'contentVector',
        type: 'Collection(Edm.Single)',
        searchable: true,
        filterable: false,
        retrievable: false,
        dimensions: AZURE_CONFIG.embeddingDimensions,
        vectorSearchProfile: 'hoa-vector-profile',
      },
      {
        name: 'sectionNumber',
        type: 'Edm.String',
        searchable: true,
        filterable: true,
        retrievable: true,
      },
      {
        name: 'sectionTitle',
        type: 'Edm.String',
        searchable: true,
        filterable: false,
        retrievable: true,
      },
      {
        name: 'chunkIndex',
        type: 'Edm.Int32',
        searchable: false,
        filterable: true,
        retrievable: true,
      },
      {
        name: 'hasSection',
        type: 'Edm.Boolean',
        searchable: false,
        filterable: true,
        retrievable: true,
      },
      {
        name: 'wordCount',
        type: 'Edm.Int32',
        searchable: false,
        filterable: true,
        retrievable: true,
      },
      {
        name: 'hasLegalTerms',
        type: 'Edm.Boolean',
        searchable: false,
        filterable: true,
        retrievable: true,
      },
    ],
    vectorSearch: {
      profiles: [
        {
          name: 'hoa-vector-profile',
          algorithm: 'hoa-hnsw-algorithm',
        },
      ],
      algorithms: [
        {
          name: 'hoa-hnsw-algorithm',
          kind: 'hnsw',
          hnswParameters: {
            metric: 'cosine',
            m: 4,
            efConstruction: 400,
            efSearch: 500,
          },
        },
      ],
    },
  };
  
  try {
    // Use the Search Management API to create/update index
    const managementUrl = `${endpoint}/indexes/${AZURE_CONFIG.indexName}?api-version=2024-07-01`;
    
    const response = await fetch(managementUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(indexDefinition),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create/update index:', response.status, errorText);
      throw new Error(`Failed to create index: ${response.status} ${response.statusText}`);
    }
    
    console.log(`✅ Index '${AZURE_CONFIG.indexName}' created/updated successfully`);
    
  } catch (error) {
    console.error('Error creating/updating index:', error);
    throw error;
  }
}

/**
 * Upload documents to the search index
 * @param {Array} documents - Array of document objects to upload
 * @returns {Promise} Promise resolving when upload is complete
 */
export async function uploadDocuments(documents) {
  const searchClient = getSearchClient();
  
  try {
    // Validate documents
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('Documents must be a non-empty array');
    }
    
    // Upload in batches to avoid limits
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }
    
    console.log(`📤 Uploading ${documents.length} documents in ${batches.length} batches`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📤 Uploading batch ${i + 1}/${batches.length} (${batch.length} documents)`);
      
      const result = await searchClient.uploadDocuments(batch);
      
      // Check for any failures
      const failures = result.results.filter(r => !r.succeeded);
      if (failures.length > 0) {
        console.warn(`⚠️  ${failures.length} documents failed to upload in batch ${i + 1}`);
        failures.forEach(failure => {
          console.warn(`Failed to upload document ${failure.key}:`, failure.errorMessage);
        });
      }
      
      console.log(`✅ Batch ${i + 1} completed: ${result.results.filter(r => r.succeeded).length} successful`);
    }
    
    console.log(`✅ Document upload completed`);
    
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw error;
  }
}

/**
 * Perform semantic search with vector similarity
 * @param {string} query - Search query text
 * @param {Object} options - Search options
 * @returns {Array} Search results with scores and metadata
 */
export async function searchDocuments(query, options = {}) {
  const {
    top = AZURE_CONFIG.searchTopK,
    threshold = AZURE_CONFIG.searchThreshold,
    includeVectorSearch = true,
    includeTextSearch = true,
  } = options;
  
  const searchClient = getSearchClient();
  
  try {
    // Generate query embedding for vector search
    let queryVector = null;
    if (includeVectorSearch) {
      const embeddings = await generateEmbeddings(query);
      queryVector = embeddings[0];
    }
    
    // Build search parameters
    const searchOptions = {
      top,
      select: ['id', 'content', 'sectionNumber', 'sectionTitle', 'chunkIndex', 'hasSection', 'wordCount'],
      includeTotalCount: true,
    };
    
    // Add vector search if enabled
    if (includeVectorSearch && queryVector) {
      searchOptions.vectors = [
        {
          kind: 'vector',
          vector: queryVector,
          fields: ['contentVector'],
          kNearestNeighborsCount: top * 2, // Get more candidates
        },
      ];
    }
    
    // Add text search if enabled
    if (includeTextSearch) {
      searchOptions.searchText = query;
      searchOptions.searchMode = 'any';
      // Semantic search requires higher tier - using simple search instead
    }
    
    // Perform the search
    const searchResults = await searchClient.search(
      includeTextSearch ? query : '*',
      searchOptions
    );
    
    // Process results
    const results = [];
    for await (const result of searchResults.results) {
      const score = result.score || 0;
      
      // Apply threshold filter
      if (score >= threshold) {
        results.push({
          id: result.document.id,
          content: result.document.content,
          sectionNumber: result.document.sectionNumber,
          sectionTitle: result.document.sectionTitle,
          chunkIndex: result.document.chunkIndex,
          hasSection: result.document.hasSection,
          wordCount: result.document.wordCount,
          score,
          searchScore: result.searchScore,
          rerankerScore: result.rerankerScore,
        });
      }
    }
    
    console.log(`🔍 Search completed: ${results.length} results above threshold`);
    console.log(`📊 Total documents in index: ${searchResults.count}`);
    
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
}

/**
 * Delete all documents from the index
 * @returns {Promise} Promise resolving when deletion is complete
 */
export async function clearIndex() {
  const searchClient = getSearchClient();
  
  try {
    // Get all document IDs
    const searchResults = await searchClient.search('*', {
      select: ['id'],
      top: 10000, // Adjust based on expected document count
    });
    
    const idsToDelete = [];
    for await (const result of searchResults.results) {
      idsToDelete.push(result.document.id);
    }
    
    if (idsToDelete.length === 0) {
      console.log('ℹ️  Index is already empty');
      return;
    }
    
    console.log(`🗑️  Deleting ${idsToDelete.length} documents from index`);
    
    // Delete documents in batches
    const batchSize = 100;
    for (let i = 0; i < idsToDelete.length; i += batchSize) {
      const batch = idsToDelete.slice(i, i + batchSize);
      const documentsToDelete = batch.map(id => ({ id }));
      
      await searchClient.deleteDocuments(documentsToDelete);
      console.log(`🗑️  Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(idsToDelete.length / batchSize)}`);
    }
    
    console.log('✅ Index cleared successfully');
    
  } catch (error) {
    console.error('Error clearing index:', error);
    throw error;
  }
}

/**
 * Get index statistics
 * @returns {Object} Index statistics and health info
 */
export async function getIndexStats() {
  const searchClient = getSearchClient();
  
  try {
    // Get document count
    const searchResults = await searchClient.search('*', {
      top: 0,
      includeTotalCount: true,
    });
    
    // Get a sample document to check structure
    const sampleResults = await searchClient.search('*', {
      top: 1,
      select: ['id', 'sectionNumber', 'sectionTitle', 'hasSection'],
    });
    
    let sampleDocument = null;
    for await (const result of sampleResults.results) {
      sampleDocument = result.document;
      break;
    }
    
    return {
      indexName: AZURE_CONFIG.indexName,
      documentCount: searchResults.count,
      hasDocuments: searchResults.count > 0,
      sampleDocument,
      embeddingModel: AZURE_CONFIG.embeddingModel,
      embeddingDimensions: AZURE_CONFIG.embeddingDimensions,
    };
    
  } catch (error) {
    console.error('Error getting index stats:', error);
    throw error;
  }
}