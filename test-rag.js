#!/usr/bin/env node

/**
 * Simple RAG System Test
 * 
 * This script tests the retrieval functionality of the HOA AI Assistant
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { searchDocuments, getIndexStats } from './lib/azureSearch.js';

async function testRAG() {
  console.log('🧪 Testing HOA AI Assistant RAG System\n');
  
  try {
    // Test 1: Get index statistics
    console.log('📊 Test 1: Index Statistics');
    const stats = await getIndexStats();
    console.log(`   Index: ${stats.indexName}`);
    console.log(`   Documents: ${stats.documentCount}`);
    console.log(`   Model: ${stats.embeddingModel}`);
    console.log(`   Dimensions: ${stats.embeddingDimensions}`);
    console.log('');
    
    // Test 2: Basic search
    console.log('🔍 Test 2: Basic Search - "HOA fees"');
    const results1 = await searchDocuments('HOA fees', { top: 3 });
    console.log(`   Found ${results1.length} results`);
    results1.forEach((result, i) => {
      console.log(`   ${i+1}. Section ${result.sectionNumber}: ${result.sectionTitle}`);
      console.log(`      Score: ${result.score?.toFixed(3)}`);
      console.log(`      Preview: ${result.content.substring(0, 100)}...`);
    });
    console.log('');
    
    // Test 3: Specific section search
    console.log('🔍 Test 3: Board of Directors');
    const results2 = await searchDocuments('Board of Directors powers duties', { top: 3 });
    console.log(`   Found ${results2.length} results`);
    results2.forEach((result, i) => {
      console.log(`   ${i+1}. Section ${result.sectionNumber}: ${result.sectionTitle}`);
      console.log(`      Score: ${result.score?.toFixed(3)}`);
      console.log(`      Preview: ${result.content.substring(0, 100)}...`);
    });
    console.log('');
    
    // Test 4: Pet policy search
    console.log('🔍 Test 4: Pet Policy');
    const results3 = await searchDocuments('pets animals restrictions', { top: 2 });
    console.log(`   Found ${results3.length} results`);
    results3.forEach((result, i) => {
      console.log(`   ${i+1}. Section ${result.sectionNumber}: ${result.sectionTitle}`);
      console.log(`      Score: ${result.score?.toFixed(3)}`);
      console.log(`      Preview: ${result.content.substring(0, 100)}...`);
    });
    console.log('');
    
    console.log('✅ RAG System Test Completed Successfully!');
    console.log('🎉 Your HOA AI Assistant is ready to use at /apps/hoa-ai');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('💡 Make sure ingestion completed successfully');
  }
}

testRAG();