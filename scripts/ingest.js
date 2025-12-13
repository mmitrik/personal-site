#!/usr/bin/env node

/**
 * HOA Bylaws Ingestion Script
 * 
 * This script processes the HOA bylaws document, chunks the text,
 * generates embeddings, and uploads everything to Azure AI Search.
 * 
 * Usage:
 *   node scripts/ingest.js [options]
 * 
 * Options:
 *   --clear     Clear the index before ingestion
 *   --dry-run   Preview chunking without uploading
 *   --help      Show this help message
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chunkText, previewChunking } from '../lib/chunking.js';
import {
  createOrUpdateIndex,
  generateEmbeddings,
  uploadDocuments,
  clearIndex,
  getIndexStats,
} from '../lib/azureSearch.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  bylawsPath: path.join(__dirname, '../data/bylaws.txt'),
  chunkOptions: {
    maxChunkSize: 1000,
    overlapSize: 200,
  },
};

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🏠 HOA Bylaws Ingestion Script

This script processes the HOA bylaws document and uploads it to Azure AI Search for RAG functionality.

Usage:
  node scripts/ingest.js [options]

Options:
  --clear     Clear the existing index before ingestion
  --dry-run   Preview chunking results without uploading to Azure
  --stats     Show current index statistics
  --help      Show this help message

Environment Variables Required:
  AZURE_OPENAI_ENDPOINT       Azure OpenAI endpoint URL
  AZURE_OPENAI_API_KEY        Azure OpenAI API key
  AZURE_SEARCH_ENDPOINT       Azure AI Search endpoint URL
  AZURE_SEARCH_KEY            Azure AI Search admin key
  AZURE_SEARCH_INDEX_NAME     Name of the search index (optional, defaults to 'hoa-bylaws-index')

Examples:
  node scripts/ingest.js --dry-run          # Preview chunking
  node scripts/ingest.js --clear            # Clear index and re-ingest
  node scripts/ingest.js --stats            # Show index statistics
  node scripts/ingest.js                    # Normal ingestion
`);
}

/**
 * Validate environment variables
 */
function validateEnvironment() {
  const required = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_SEARCH_ENDPOINT',
    'AZURE_SEARCH_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Make sure to set these in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
}

/**
 * Load and validate the bylaws file
 */
async function loadBylaws() {
  try {
    console.log(`📖 Loading bylaws from: ${CONFIG.bylawsPath}`);
    
    const bylawsText = await fs.readFile(CONFIG.bylawsPath, 'utf-8');
    
    if (!bylawsText || bylawsText.trim().length === 0) {
      throw new Error('Bylaws file is empty or contains only whitespace');
    }
    
    console.log(`✅ Loaded bylaws: ${bylawsText.length} characters`);
    return bylawsText;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Bylaws file not found: ${CONFIG.bylawsPath}`);
      console.error('💡 Make sure the bylaws.txt file exists in the data/ directory');
    } else {
      console.error('❌ Error loading bylaws:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Process text into chunks with embeddings
 */
async function processChunks(text, options = {}) {
  const { dryRun = false } = options;
  
  console.log('🔪 Chunking text...');
  const chunks = chunkText(text, CONFIG.chunkOptions);
  
  console.log(`✅ Created ${chunks.length} chunks`);
  console.log(`📊 Average chunk size: ${Math.round(chunks.reduce((sum, c) => sum + c.length, 0) / chunks.length)} characters`);
  console.log(`📋 Sections found: ${chunks.filter(c => c.hasSection).length}`);
  
  if (dryRun) {
    console.log('\n📋 Dry run - Preview of first 3 chunks:');
    chunks.slice(0, 3).forEach((chunk, index) => {
      console.log(`\n--- Chunk ${index + 1} ---`);
      console.log(`ID: ${chunk.id}`);
      console.log(`Length: ${chunk.length} characters`);
      console.log(`Section: ${chunk.sectionNumber || 'N/A'} - ${chunk.sectionTitle || 'N/A'}`);
      console.log(`Preview: ${chunk.content.slice(0, 200)}...`);
    });
    
    return chunks;
  }
  
  // Generate embeddings for all chunks
  console.log('🧮 Generating embeddings...');
  const chunkTexts = chunks.map(chunk => chunk.content);
  
  try {
    const embeddings = await generateEmbeddings(chunkTexts);
    
    // Combine chunks with their embeddings
    const documents = chunks.map((chunk, index) => ({
      id: chunk.id,
      content: chunk.content,
      contentVector: embeddings[index],
      sectionNumber: chunk.sectionNumber || '',
      sectionTitle: chunk.sectionTitle || '',
      chunkIndex: chunk.chunkIndex,
      hasSection: chunk.hasSection,
      wordCount: chunk.wordCount,
      hasLegalTerms: chunk.hasLegalTerms,
    }));
    
    console.log(`✅ Generated embeddings for ${documents.length} chunks`);
    return documents;
    
  } catch (error) {
    console.error('❌ Failed to generate embeddings:', error.message);
    process.exit(1);
  }
}

/**
 * Show index statistics
 */
async function showStats() {
  try {
    console.log('📊 Getting index statistics...');
    const stats = await getIndexStats();
    
    console.log('\n📋 Index Statistics:');
    console.log(`   Index Name: ${stats.indexName}`);
    console.log(`   Document Count: ${stats.documentCount}`);
    console.log(`   Has Documents: ${stats.hasDocuments ? 'Yes' : 'No'}`);
    console.log(`   Embedding Model: ${stats.embeddingModel}`);
    console.log(`   Embedding Dimensions: ${stats.embeddingDimensions}`);
    
    if (stats.sampleDocument) {
      console.log('\n📄 Sample Document:');
      console.log(`   ID: ${stats.sampleDocument.id}`);
      console.log(`   Section: ${stats.sampleDocument.sectionNumber || 'N/A'}`);
      console.log(`   Title: ${stats.sampleDocument.sectionTitle || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Failed to get index statistics:', error.message);
    if (error.message.includes('Index not found')) {
      console.log('💡 Index does not exist yet. Run ingestion to create it.');
    }
  }
}

/**
 * Main ingestion process
 */
async function runIngestion(options = {}) {
  const { clearFirst = false, dryRun = false } = options;
  
  console.log('🚀 Starting HOA Bylaws ingestion...\n');
  
  // Validate environment
  validateEnvironment();
  
  // Load bylaws
  const bylawsText = await loadBylaws();
  
  // Process chunks
  const documents = await processChunks(bylawsText, { dryRun });
  
  if (dryRun) {
    console.log('\n✅ Dry run completed successfully');
    return;
  }
  
  try {
    // Create or update index schema
    console.log('🏗️  Creating/updating search index...');
    await createOrUpdateIndex();
    
    // Clear index if requested
    if (clearFirst) {
      console.log('🗑️  Clearing existing index...');
      await clearIndex();
    }
    
    // Upload documents
    console.log('📤 Uploading documents to search index...');
    await uploadDocuments(documents);
    
    // Show final statistics
    console.log('\n📊 Final Statistics:');
    await showStats();
    
    console.log('\n✅ Ingestion completed successfully!');
    console.log('🎉 Your HOA AI Assistant is now ready to answer questions based on the bylaws.');
    
  } catch (error) {
    console.error('\n❌ Ingestion failed:', error.message);
    console.error('💡 Check your Azure configuration and try again');
    process.exit(1);
  }
}

/**
 * Parse command line arguments and run appropriate action
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse options
  const options = {
    clearFirst: args.includes('--clear'),
    dryRun: args.includes('--dry-run'),
    showStats: args.includes('--stats'),
    help: args.includes('--help'),
  };
  
  // Show help
  if (options.help) {
    showHelp();
    return;
  }
  
  // Show statistics only
  if (options.showStats) {
    await showStats();
    return;
  }
  
  // Run ingestion
  await runIngestion(options);
}

// Handle errors and run main function
main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Ingestion interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Ingestion terminated');
  process.exit(0);
});