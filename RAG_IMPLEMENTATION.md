# HOA AI Assistant - RAG Implementation Guide

## 🎯 Overview

The HOA AI Assistant has been upgraded with Retrieval-Augmented Generation (RAG) capabilities, allowing it to answer questions based exclusively on your community's actual HOA bylaws. The system now searches through the official bylaws document to provide accurate, cited responses.

## 🏗️ Architecture

```
User Question
     ↓
Azure AI Search (Vector Search)
     ↓
Retrieved Bylaw Sections
     ↓
Azure OpenAI (GPT-4o-mini) + Context
     ↓
Accurate Answer with Citations
```

## 📁 Project Structure

```
/data/
  bylaws.txt              # HOA bylaws document
/lib/
  chunking.js            # Text chunking utilities
  azureSearch.js         # Azure AI Search integration
/scripts/
  ingest.js              # Bylaws ingestion script
/src/app/api/
  ask/route.js           # RAG-enhanced API endpoint
/tests/
  retrieval.test.js      # Retrieval accuracy tests
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @azure/search-documents
# or
yarn add @azure/search-documents
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Azure credentials:

```bash
# Azure OpenAI for embeddings and chat
AZURE_OPENAI_ENDPOINT=https://your-openai-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-openai-api-key

# Azure AI Search for vector storage
AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_SEARCH_KEY=your-search-admin-key
AZURE_SEARCH_INDEX_NAME=hoa-bylaws-index

# HOA AI specific configuration
AZURE_HOA_AI_ENDPOINT=https://your-hoa-ai-resource.openai.azure.com
AZURE_HOA_AI_API_KEY=your-hoa-ai-api-key
AZURE_HOA_AI_DEPLOYMENT_NAME=gpt-4o-mini
```

### 3. Ingest Your Bylaws

First, replace `/data/bylaws.txt` with your community's actual bylaws, then run:

```bash
# Preview chunking (recommended first)
npm run ingest:preview

# Perform the ingestion
npm run ingest

# Clear and re-ingest (if needed)
npm run ingest:clear
```

### 4. Test the System

```bash
# Run retrieval tests
npm run test:retrieval

# Check ingestion statistics
npm run ingest:stats
```

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000/apps/hoa-ai` to use the RAG-enhanced assistant.

## 🔧 Key Components

### Text Chunking (`lib/chunking.js`)
- Splits bylaws into ~1000 character chunks with 200 character overlap
- Preserves section structure and metadata
- Extracts section numbers and titles automatically
- Handles legal document formatting

### Azure Integration (`lib/azureSearch.js`)
- **Embeddings**: Uses `text-embedding-3-large` for high-quality vector representations
- **Vector Search**: Semantic similarity search through bylaws content
- **Hybrid Search**: Combines vector and keyword search for best results
- **Index Management**: Automatic schema creation and document upload

### RAG API (`src/app/api/ask/route.js`)
- Retrieves top 5 most relevant bylaw sections
- Provides structured context to GPT-4o-mini
- Enforces bylaws-only responses with citations
- Returns section numbers and source references

### Ingestion Script (`scripts/ingest.js`)
- CLI tool for processing and uploading bylaws
- Supports dry-run mode for testing
- Batch processing for efficient uploads
- Error handling and progress reporting

## 📊 Performance Optimization

### Chunking Strategy
- **Chunk Size**: 1000 characters balances context and precision
- **Overlap**: 200 characters prevents information loss at boundaries
- **Metadata**: Section numbers enable precise citations
- **Filtering**: Legal term detection improves relevance scoring

### Search Configuration
- **Top-K**: Retrieves 5 most relevant chunks per query
- **Threshold**: 0.7 similarity score minimum for quality results
- **Vector Dimensions**: 3072 dimensions for high precision
- **Algorithm**: HNSW for fast approximate search

### Caching Strategy
- **Embedding Caching**: Avoid re-computing embeddings for identical queries
- **Index Optimization**: Efficient vector search with optimized parameters
- **Response Caching**: Cache common questions for faster responses

## 🧪 Testing

### Unit Tests
```bash
# Run all retrieval tests
npm run test:retrieval

# Test specific functionality
npm test -- --testNamePattern="Basic Search"
```

### Test Coverage
- **Search Functionality**: Basic queries, edge cases, error handling
- **Retrieval Accuracy**: Section-specific queries, keyword matching
- **Performance**: Response times, concurrent queries
- **Integration**: Full RAG pipeline end-to-end

### Expected Results
- Architectural questions → Section 8.x results
- Fee questions → Section 7.x results  
- Meeting questions → Section 6.x results
- Pet policy questions → Section 9.3 results

## 🔍 Usage Examples

### Basic Questions
```
Q: "How are HOA fees calculated?"
A: "Annual assessments are fixed by the Board and payable in monthly installments on the first day of each month (Section 7.2)..."

Sources: Section 7.2 - Annual Assessments
Based on 3 relevant sections from the HOA bylaws.
```

### Specific Policy Questions  
```
Q: "Can I have more than 2 pets?"
A: "No, the bylaws specify a maximum of two pets per Lot (Section 9.3)..."

Sources: Section 9.3 - Pet Restrictions
Based on 1 relevant section from the HOA bylaws.
```

### Complex Queries
```
Q: "What's the process for getting architectural approval for a fence?"
A: "You need prior written approval from the Architectural Review Committee. Submit an application with detailed plans, specifications, and materials samples. The Committee will respond within 45 days (Section 8.2, 8.3)..."

Sources: Section 8.2 - Approval Required, Section 8.3 - Application Process
Based on 4 relevant sections from the HOA bylaws.
```

## 🛡️ Security Considerations

### Environment Variables
- Store API keys securely in `.env.local`
- Never commit credentials to version control
- Use different keys for development and production
- Rotate keys regularly

### Data Privacy
- Bylaws are typically public documents
- No personal information stored in search index
- Query logs should be anonymized
- Comply with community privacy policies

### Access Control
- Consider implementing user authentication
- Rate limiting for API endpoints
- Monitor usage patterns
- Audit log access and queries

## 🚨 Troubleshooting

### Common Issues

**"Index not found" Error**
```bash
# Solution: Run ingestion to create the index
npm run ingest
```

**"No results found" for known topics**
```bash
# Solution: Check similarity threshold and re-run ingestion
npm run ingest:stats
npm run ingest:clear
```

**"Failed to generate embeddings"**
- Check Azure OpenAI endpoint and API key
- Verify deployment name and model availability
- Check quota and rate limits

**Empty responses from RAG endpoint**
- Verify Azure AI Search configuration
- Check that documents were successfully ingested
- Test with `npm run test:retrieval`

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG=hoa-ai:*
```

### Performance Issues
- Monitor Azure Search query units (QU) usage
- Consider upgrading search tier for better performance
- Implement response caching for common queries
- Optimize chunk size based on query patterns

## 📈 Monitoring and Analytics

### Key Metrics
- **Query Response Time**: Should be < 3 seconds
- **Retrieval Accuracy**: % of queries finding relevant sections
- **User Satisfaction**: Questions answered vs. "I don't know" responses
- **Cost Optimization**: Embedding and search API usage

### Logging
- Query patterns and frequency
- Failed searches and reasons
- Response quality feedback
- Performance metrics

## 🔄 Maintenance

### Regular Tasks
1. **Update Bylaws**: Re-run ingestion when bylaws change
2. **Monitor Usage**: Review query patterns and common questions
3. **Test Accuracy**: Run retrieval tests monthly
4. **Update Models**: Consider newer embedding models as available

### Seasonal Maintenance
- Review and update test cases
- Analyze query patterns for content gaps
- Optimize chunk size based on usage data
- Update documentation and examples

## 📚 Additional Resources

- [Azure AI Search Documentation](https://docs.microsoft.com/azure/search/)
- [Azure OpenAI Service Documentation](https://docs.microsoft.com/azure/cognitive-services/openai/)
- [RAG Best Practices Guide](https://docs.microsoft.com/azure/architecture/ai-ml/guide/rag-solution)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)

## 🎉 Success Criteria

Your RAG implementation is successful when:

✅ **Accurate Responses**: Questions about bylaws return correct, cited answers  
✅ **Source Attribution**: All responses include relevant section numbers  
✅ **Scope Limitation**: "I don't know" for questions not in bylaws  
✅ **Performance**: Responses under 3 seconds  
✅ **Test Coverage**: All retrieval tests passing  
✅ **User Experience**: Clear, helpful responses with proper formatting

---

**Need Help?** Check the troubleshooting section above or review the test cases in `/tests/retrieval.test.js` for expected behavior examples.