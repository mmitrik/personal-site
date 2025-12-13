/**
 * Text Chunking Utilities for HOA Bylaws RAG System
 * 
 * This module provides functionality to split the HOA bylaws document into 
 * overlapping chunks suitable for embedding and retrieval.
 */

/**
 * Configuration for text chunking
 */
export const CHUNK_CONFIG = {
  maxChunkSize: 1500,     // Maximum characters per chunk (increased for more context)
  overlapSize: 300,       // Characters to overlap between chunks (increased to prevent info loss)
  minChunkSize: 100,      // Minimum viable chunk size
};

/**
 * Extract section information from text
 * @param {string} text - Text to analyze for section markers
 * @returns {Object} Section metadata
 */
function extractSectionInfo(text) {
  // Look for ARTICLE patterns like "ARTICLE I", "ARTICLE II", etc.
  const articleMatch = text.match(/ARTICLE\s+([IVX]+|[0-9]+)\s*\n?\s*(.+?)(?:\n|$)/i);
  if (articleMatch) {
    return {
      sectionNumber: `Article ${articleMatch[1]}`,
      sectionTitle: articleMatch[2]?.trim(),
      hasSection: true
    };
  }
  
  // Look for lettered subsections like "A. Architectural Control Committee"
  const letterMatch = text.match(/^([A-Z])\.\s+(.+?)(?:\n|\.)/m);
  if (letterMatch) {
    return {
      sectionNumber: letterMatch[1],
      sectionTitle: letterMatch[2]?.trim(),
      hasSection: true
    };
  }
  
  // Look for numbered sections like "1. From and after January 1"
  const numberMatch = text.match(/^(\d+)\.\s+(.+?)(?:\n|\.)/m);
  if (numberMatch) {
    return {
      sectionNumber: numberMatch[1],
      sectionTitle: numberMatch[2]?.substring(0, 50).trim(),
      hasSection: true
    };
  }
  
  // Look for section patterns like "Section 4.1", "ARTICLE III", etc. (legacy format)
  const sectionMatch = text.match(/(?:Section\s+(\d+\.\d+)|ARTICLE\s+([IVX]+))\s*[-–]\s*(.+?)(?:\n|$)/i);
  if (sectionMatch) {
    return {
      sectionNumber: sectionMatch[1] || sectionMatch[2],
      sectionTitle: sectionMatch[3]?.trim(),
      hasSection: true
    };
  }
  
  // Look for subsection patterns (legacy format)
  const subsectionMatch = text.match(/\*\*Section\s+(\d+\.\d+)\s*[-–]\s*(.+?)\*\*/i);
  if (subsectionMatch) {
    return {
      sectionNumber: subsectionMatch[1],
      sectionTitle: subsectionMatch[2]?.trim(),
      hasSection: true
    };
  }
  
  return {
    sectionNumber: null,
    sectionTitle: null,
    hasSection: false
  };
}

/**
 * Clean text by removing excessive whitespace and markdown formatting
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Find optimal chunk boundaries to avoid splitting sentences
 * @param {string} text - Text to find boundary in
 * @param {number} position - Approximate position for boundary
 * @param {boolean} isEnd - Whether this is an end boundary
 * @returns {number} Optimal boundary position
 */
function findOptimalBoundary(text, position, isEnd = false) {
  // If we're at the very start or end, return as-is
  if (position <= 0) return 0;
  if (position >= text.length) return text.length;
  
  // Look for sentence endings within a reasonable range
  const searchRange = 50;
  const start = Math.max(0, position - searchRange);
  const end = Math.min(text.length, position + searchRange);
  
  const searchText = text.slice(start, end);
  
  // Find sentence boundaries (periods, exclamation, question marks followed by space/newline)
  const sentenceEndings = [...searchText.matchAll(/[.!?][\s\n]/g)];
  
  if (sentenceEndings.length > 0) {
    let bestMatch;
    if (isEnd) {
      // For end boundaries, prefer later sentence endings
      bestMatch = sentenceEndings[sentenceEndings.length - 1];
    } else {
      // For start boundaries, prefer earlier sentence endings
      bestMatch = sentenceEndings[0];
    }
    
    return start + bestMatch.index + 1; // +1 to include the punctuation
  }
  
  // If no sentence boundary found, look for paragraph breaks
  const paragraphBreaks = [...searchText.matchAll(/\n\n/g)];
  if (paragraphBreaks.length > 0) {
    const match = isEnd ? 
      paragraphBreaks[paragraphBreaks.length - 1] : 
      paragraphBreaks[0];
    return start + match.index;
  }
  
  // Fall back to word boundaries
  const words = [...searchText.matchAll(/\s+/g)];
  if (words.length > 0) {
    const match = isEnd ? 
      words[words.length - 1] : 
      words[0];
    return start + match.index;
  }
  
  // Last resort: return original position
  return position;
}

/**
 * Split text into overlapping chunks with metadata
 * @param {string} text - Full text to chunk
 * @param {Object} options - Chunking options
 * @returns {Array} Array of chunk objects with content and metadata
 */
export function chunkText(text, options = {}) {
  const config = { ...CHUNK_CONFIG, ...options };
  const chunks = [];
  
  // Clean the input text
  const cleanedText = cleanText(text);
  
  let position = 0;
  let chunkIndex = 0;
  
  while (position < cleanedText.length) {
    // Calculate chunk boundaries
    const chunkEnd = Math.min(position + config.maxChunkSize, cleanedText.length);
    
    // Find optimal boundaries to avoid splitting sentences
    const actualEnd = findOptimalBoundary(cleanedText, chunkEnd, true);
    
    // Extract chunk content
    let chunkContent = cleanedText.slice(position, actualEnd).trim();
    
    // Skip chunks that are too small
    if (chunkContent.length < config.minChunkSize && position > 0) {
      break;
    }
    
    // Extract section information from the chunk
    const sectionInfo = extractSectionInfo(chunkContent);
    
    // Create chunk object with metadata
    const chunk = {
      id: `chunk_${chunkIndex}`,
      content: chunkContent,
      startPosition: position,
      endPosition: actualEnd,
      length: chunkContent.length,
      chunkIndex: chunkIndex,
      ...sectionInfo,
      // Additional metadata
      wordCount: chunkContent.split(/\s+/).length,
      hasLegalTerms: /(?:shall|may|must|required|prohibited|violation|fine|lien|assessment)/i.test(chunkContent),
      containsNumbers: /\d+/.test(chunkContent),
      containsDates: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/i.test(chunkContent)
    };
    
    chunks.push(chunk);
    chunkIndex++;
    
    // Calculate next position with overlap
    const nextPosition = Math.max(
      actualEnd - config.overlapSize,
      position + 1 // Ensure we make progress
    );
    
    position = nextPosition;
    
    // Safety break to prevent infinite loops
    if (position >= cleanedText.length - config.minChunkSize) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Get chunks that contain specific section numbers
 * @param {Array} chunks - Array of chunk objects
 * @param {string} sectionNumber - Section number to search for
 * @returns {Array} Matching chunks
 */
export function getChunksBySection(chunks, sectionNumber) {
  return chunks.filter(chunk => 
    chunk.sectionNumber === sectionNumber ||
    chunk.content.includes(`Section ${sectionNumber}`)
  );
}

/**
 * Search chunks by content keywords
 * @param {Array} chunks - Array of chunk objects
 * @param {string|Array} keywords - Keywords to search for
 * @returns {Array} Matching chunks with relevance scores
 */
export function searchChunksByKeywords(chunks, keywords) {
  const searchTerms = Array.isArray(keywords) ? keywords : [keywords];
  
  return chunks
    .map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      
      searchTerms.forEach(term => {
        const lowerTerm = term.toLowerCase();
        const matches = (lowerContent.match(new RegExp(lowerTerm, 'g')) || []).length;
        score += matches;
        
        // Boost score if term appears in section title
        if (chunk.sectionTitle?.toLowerCase().includes(lowerTerm)) {
          score += 2;
        }
      });
      
      return { ...chunk, relevanceScore: score };
    })
    .filter(chunk => chunk.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Preview chunking results for debugging
 * @param {string} text - Text to analyze
 * @param {Object} options - Chunking options
 * @returns {Object} Summary of chunking results
 */
export function previewChunking(text, options = {}) {
  const chunks = chunkText(text, options);
  
  return {
    totalChunks: chunks.length,
    averageChunkSize: Math.round(chunks.reduce((sum, c) => sum + c.length, 0) / chunks.length),
    sectionsFound: chunks.filter(c => c.hasSection).length,
    sectionNumbers: [...new Set(chunks.map(c => c.sectionNumber).filter(Boolean))],
    totalCharacters: text.length,
    coveragePercentage: Math.round((chunks.reduce((sum, c) => sum + c.length, 0) / text.length) * 100),
    sampleChunks: chunks.slice(0, 3).map(c => ({
      id: c.id,
      length: c.length,
      sectionNumber: c.sectionNumber,
      sectionTitle: c.sectionTitle,
      preview: c.content.slice(0, 100) + '...'
    }))
  };
}