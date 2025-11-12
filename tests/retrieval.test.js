/**
 * Retrieval Accuracy Tests for HOA AI Assistant RAG System
 * 
 * These tests validate that the RAG system correctly retrieves and processes
 * information from the HOA bylaws for various types of questions.
 * 
 * To run tests:
 *   npm test tests/retrieval.test.js
 * 
 * Prerequisites:
 *   - Environment variables configured
 *   - Bylaws ingested into Azure AI Search
 *   - Node.js testing framework (Jest recommended)
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { searchDocuments, getIndexStats } from '../lib/azureSearch.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  minRelevanceScore: 0.7,
  maxResponseTime: 10000, // 10 seconds
  expectedChunks: 5, // Expected number of chunks for comprehensive tests
};

// Test cases with expected sections
const TEST_CASES = [
  {
    name: 'Architectural Approval Process',
    question: 'What are the architectural approval requirements?',
    expectedSections: ['8.1', '8.2', '8.3'],
    expectedKeywords: ['architectural', 'approval', 'committee', 'modification']
  },
  {
    name: 'HOA Fee Information',
    question: 'How are HOA fees calculated and collected?',
    expectedSections: ['7.1', '7.2', '7.4'],
    expectedKeywords: ['assessment', 'fees', 'monthly', 'Board']
  },
  {
    name: 'Pet Restrictions',
    question: 'What are the rules about pets in the community?',
    expectedSections: ['9.3'],
    expectedKeywords: ['pets', 'maximum', 'leashed', 'aggressive']
  },
  {
    name: 'Meeting Procedures',
    question: 'When are HOA meetings held and how do I attend?',
    expectedSections: ['6.1', '6.2', '6.3'],
    expectedKeywords: ['meeting', 'annual', 'notice', 'March']
  },
  {
    name: 'Violation Process',
    question: 'What happens if I violate HOA rules?',
    expectedSections: ['10.1', '10.2', '10.3'],
    expectedKeywords: ['violation', 'notice', 'fine', 'hearing']
  },
  {
    name: 'Board Composition',
    question: 'Who serves on the HOA board and for how long?',
    expectedSections: ['4.1', '4.2', '4.3'],
    expectedKeywords: ['Board', 'Directors', 'five', 'two-year', 'terms']
  }
];

/**
 * Setup tests by validating environment and index status
 */
beforeAll(async () => {
  console.log('🧪 Setting up retrieval tests...');
  
  // Check environment variables
  const requiredEnvVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_SEARCH_ENDPOINT',
    'AZURE_SEARCH_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  // Check if bylaws file exists
  const bylawsPath = path.join(__dirname, '../data/bylaws.txt');
  try {
    await fs.access(bylawsPath);
  } catch (error) {
    throw new Error(`Bylaws file not found: ${bylawsPath}`);
  }
  
  // Check index status
  try {
    const stats = await getIndexStats();
    if (!stats.hasDocuments) {
      throw new Error('Search index is empty. Run ingestion script first: node scripts/ingest.js');
    }
    console.log(`✅ Index ready with ${stats.documentCount} documents`);
  } catch (error) {
    if (error.message.includes('Index not found')) {
      throw new Error('Search index not found. Run ingestion script first: node scripts/ingest.js');
    }
    throw error;
  }
}, 30000); // 30 second timeout for setup

/**
 * Test search functionality with basic queries
 */
describe('Basic Search Functionality', () => {
  test('should return results for simple queries', async () => {
    const results = await searchDocuments('assessment fees');
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Check result structure
    const firstResult = results[0];
    expect(firstResult).toHaveProperty('content');
    expect(firstResult).toHaveProperty('score');
    expect(firstResult).toHaveProperty('id');
  });
  
  test('should handle empty queries gracefully', async () => {
    const results = await searchDocuments('');
    expect(Array.isArray(results)).toBe(true);
  });
  
  test('should return no results for irrelevant queries', async () => {
    const results = await searchDocuments('quantum physics space travel');
    expect(results.length).toBe(0);
  });
});

/**
 * Test retrieval accuracy for known content
 */
describe('Retrieval Accuracy Tests', () => {
  TEST_CASES.forEach(testCase => {
    test(`should retrieve relevant content for: ${testCase.name}`, async () => {
      const startTime = Date.now();
      
      const results = await searchDocuments(testCase.question, {
        top: 10,
        threshold: 0.5 // Lower threshold for testing
      });
      
      const responseTime = Date.now() - startTime;
      
      // Performance check
      expect(responseTime).toBeLessThan(TEST_CONFIG.maxResponseTime);
      
      // Results check
      expect(results.length).toBeGreaterThan(0);
      
      // Check if expected sections are found
      const foundSections = results
        .map(r => r.sectionNumber)
        .filter(Boolean);
      
      const hasExpectedSection = testCase.expectedSections.some(
        expectedSection => foundSections.includes(expectedSection)
      );
      
      expect(hasExpectedSection).toBe(true);
      
      // Check content relevance by keywords
      const allContent = results.map(r => r.content).join(' ').toLowerCase();
      
      const hasRelevantKeywords = testCase.expectedKeywords.some(
        keyword => allContent.includes(keyword.toLowerCase())
      );
      
      expect(hasRelevantKeywords).toBe(true);
      
      console.log(`✅ ${testCase.name}: Found ${results.length} results in ${responseTime}ms`);
      console.log(`   Sections: ${foundSections.slice(0, 3).join(', ')}`);
    }, 15000); // 15 second timeout per test
  });
});

/**
 * Test section-specific queries
 */
describe('Section-Specific Retrieval', () => {
  test('should find specific sections by number', async () => {
    const results = await searchDocuments('Section 4.1');
    
    expect(results.length).toBeGreaterThan(0);
    
    const hasCorrectSection = results.some(
      result => result.sectionNumber === '4.1'
    );
    
    expect(hasCorrectSection).toBe(true);
  });
  
  test('should retrieve related sections for broad topics', async () => {
    const results = await searchDocuments('architectural review committee');
    
    const architecturalSections = results.filter(
      result => result.sectionNumber?.startsWith('8.')
    );
    
    expect(architecturalSections.length).toBeGreaterThan(0);
  });
});

/**
 * Test search ranking and relevance
 */
describe('Search Ranking and Relevance', () => {
  test('should rank more relevant results higher', async () => {
    const results = await searchDocuments('Board of Directors meetings');
    
    expect(results.length).toBeGreaterThan(1);
    
    // Check that results are sorted by score (descending)
    for (let i = 1; i < results.length; i++) {
      expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });
  
  test('should return high-quality results above threshold', async () => {
    const results = await searchDocuments('assessment late fees', {
      threshold: TEST_CONFIG.minRelevanceScore
    });
    
    results.forEach(result => {
      expect(result.score).toBeGreaterThanOrEqual(TEST_CONFIG.minRelevanceScore);
    });
  });
});

/**
 * Test edge cases and error handling
 */
describe('Edge Cases and Error Handling', () => {
  test('should handle very long queries', async () => {
    const longQuery = 'architectural review committee approval process for modifications additions alterations exterior changes property improvements landscaping fencing structures buildings construction renovation remodeling'.repeat(3);
    
    const results = await searchDocuments(longQuery);
    expect(Array.isArray(results)).toBe(true);
  });
  
  test('should handle queries with special characters', async () => {
    const results = await searchDocuments('Section 4.1 - Board');
    expect(Array.isArray(results)).toBe(true);
  });
  
  test('should handle case-insensitive searches', async () => {
    const results1 = await searchDocuments('BOARD OF DIRECTORS');
    const results2 = await searchDocuments('board of directors');
    
    expect(results1.length).toBeGreaterThan(0);
    expect(results2.length).toBeGreaterThan(0);
  });
});

/**
 * Integration test with the full RAG pipeline
 */
describe('Full RAG Pipeline Integration', () => {
  test('should simulate end-to-end RAG query', async () => {
    const testQuestion = 'What are the requirements for architectural approval?';
    
    // Step 1: Retrieve relevant chunks
    const chunks = await searchDocuments(testQuestion, {
      top: 5,
      threshold: 0.7
    });
    
    expect(chunks.length).toBeGreaterThan(0);
    
    // Step 2: Verify we have architectural content
    const hasArchitecturalContent = chunks.some(
      chunk => chunk.content.toLowerCase().includes('architectural')
    );
    
    expect(hasArchitecturalContent).toBe(true);
    
    // Step 3: Check that we have section references
    const hasSectionNumbers = chunks.some(
      chunk => chunk.sectionNumber && chunk.sectionTitle
    );
    
    expect(hasSectionNumbers).toBe(true);
    
    console.log('✅ Full RAG pipeline test passed');
    console.log(`   Retrieved ${chunks.length} relevant chunks`);
    console.log(`   Sections: ${chunks.map(c => c.sectionNumber).filter(Boolean).join(', ')}`);
  });
});

/**
 * Performance and reliability tests
 */
describe('Performance and Reliability', () => {
  test('should handle concurrent queries', async () => {
    const queries = [
      'HOA fees',
      'pet restrictions', 
      'board meetings',
      'architectural approval'
    ];
    
    const startTime = Date.now();
    
    const promises = queries.map(query => searchDocuments(query));
    const results = await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    
    // All queries should return results
    results.forEach(result => {
      expect(Array.isArray(result)).toBe(true);
    });
    
    // Should complete reasonably quickly
    expect(totalTime).toBeLessThan(20000); // 20 seconds for 4 concurrent queries
    
    console.log(`✅ Concurrent queries completed in ${totalTime}ms`);
  });
});

/**
 * Cleanup after all tests
 */
afterAll(() => {
  console.log('🧪 Retrieval tests completed');
});