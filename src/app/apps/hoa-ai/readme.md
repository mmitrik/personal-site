# HOA AI Assistant

## 📋 Overview

The HOA AI Assistant is an intelligent chatbot designed to help homeowners navigate the complexities of Homeowners Association (HOA) policies, bylaws, and procedures. This AI-powered tool provides quick, accurate answers to common HOA questions, making community living more transparent and accessible.

## ✨ Features

- **Interactive Chat Interface**: Real-time conversation with an AI assistant specialized in HOA matters
- **Comprehensive Knowledge Base**: Covers bylaws, architectural guidelines, fees, governance, and procedures
- **Conversation History**: Scrollable chat history to maintain context throughout the conversation
- **Sample Questions**: Pre-populated common questions to help users get started
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Clear Chat Function**: Reset conversation to start fresh
- **Markdown Support**: Formatted responses with headers, lists, and emphasis for better readability

## 🛠️ Technical Stack

- **Frontend**: React 18, Next.js 15 (App Router)
- **AI Backend**: Azure AI Foundry (OpenAI GPT-4)
- **Styling**: Tailwind CSS with custom design system
- **Markdown Rendering**: react-markdown
- **API**: Next.js API Routes
- **Deployment**: Vercel

## 💬 Chat Features

### User Experience
- Multi-line input with Enter to send (Shift+Enter for new line)
- Auto-focus on input field for immediate typing
- Auto-scroll to latest messages
- Loading indicators with animated dots
- Error handling with user-friendly messages

### AI Capabilities
- Specialized knowledge in HOA governance and policies
- Context-aware conversations that remember chat history
- Professional, empathetic responses
- Disclaimers about community-specific variations
- Recommendations for consulting specific HOA documents

## 🔧 Environment Variables

The following environment variables are required for the HOA AI functionality:

```bash
# Azure AI Foundry Configuration for HOA AI
AZURE_HOA_AI_ENDPOINT=https://your-azure-ai-endpoint.openai.azure.com
AZURE_HOA_AI_API_KEY=your-azure-api-key
AZURE_HOA_AI_DEPLOYMENT_NAME=gpt-4o
```

## 📝 Usage Instructions

1. **Start a Conversation**: Click in the input area and type your HOA-related question
2. **Use Sample Questions**: Click any sample question button to populate the input
3. **Send Messages**: Press Enter to send or click the Send button
4. **Review Responses**: AI responses are formatted with markdown for easy reading
5. **Clear Chat**: Use the Clear button to reset the conversation
6. **Scroll History**: Use the scrollable chat area to review previous messages

### Example Questions

- "What are the architectural approval requirements?"
- "How are HOA fees calculated and collected?"
- "What are the rules about parking and vehicles?"
- "How do I file a complaint or violation report?"
- "What maintenance am I responsible for vs. the HOA?"
- "Can I rent out my property? What are the restrictions?"

## 🏗️ Project Structure

```
src/app/apps/hoa-ai/
├── page.js          # Main HOA AI chat component
├── readme.md        # This documentation
└── components/      # Future component additions
```

## 🌐 API Integration

### Endpoint: `/api/hoa-ai`

**Request Format:**
```javascript
{
  "messages": [
    { "role": "user", "content": "What are HOA bylaws?" },
    { "role": "assistant", "content": "HOA bylaws are..." }
  ],
  "userPrompt": "What are HOA bylaws?"
}
```

**Response Format:**
```javascript
{
  "response": "AI-generated response text",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

## 🎯 Key Components

### Main Chat Interface
- **Messages Display**: Scrollable container with user and AI message bubbles
- **Input Form**: Multi-line textarea with send/clear buttons
- **Loading States**: Animated indicators during AI processing
- **Error Handling**: User-friendly error messages

### Sample Questions Panel
- **Quick Start**: Pre-written common questions as clickable buttons
- **Easy Population**: One-click to fill input with sample questions
- **Responsive Grid**: Organized layout that adapts to screen size

## 🔍 HOA Knowledge Areas

The AI assistant is trained to help with:

- **Governance**: Board operations, meetings, voting procedures
- **Financial**: Assessments, budgets, reserve funds, fee collection
- **Architectural**: Approval processes, design guidelines, modifications
- **Enforcement**: Violation procedures, fines, compliance
- **Maintenance**: Responsibility divisions, common area upkeep
- **Legal**: Basic compliance, dispute resolution, document interpretation
- **Community**: Rules, amenities, neighbor relations

## 🚀 Future Enhancements

- [ ] **Document Upload**: Allow users to upload specific HOA documents for analysis
- [ ] **Meeting Minutes Integration**: Connect to HOA meeting recordings and minutes
- [ ] **Notification System**: Alerts for important HOA announcements
- [ ] **Multi-Language Support**: Spanish and other community languages
- [ ] **Voice Input**: Speech-to-text for accessibility
- [ ] **Advanced Search**: Search through uploaded HOA documents
- [ ] **Community Portal**: Integration with HOA management platforms
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Analytics Dashboard**: Usage statistics and common question trends

## 🧪 Development Notes

### Design System Compliance
- Uses consistent color scheme: `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `text-accent`
- Follows button styling: `bg-accent` for primary, `bg-border` for secondary
- Maintains responsive design patterns across all components

### Performance Considerations
- Limits conversation history to last 10 messages for API calls
- Implements proper loading states and error boundaries
- Uses React refs for smooth scrolling and input focus

### Accessibility
- Semantic HTML structure for screen readers
- Keyboard navigation support
- Focus management for better UX
- Color contrast compliance

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Deployment**: [HOA AI Assistant](/apps/hoa-ai)