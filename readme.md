# Spur AI Support Chat

A full-stack AI-powered customer support chat application built as part of the Spur Founding Full-Stack Engineer take-home assignment.

**Live Demo:** [https://spur-chat-nine.vercel.app/](https://spur-chat-nine.vercel.app/)

## Features

- Real-time chat interface with AI-powered responses
- Conversation persistence across page reloads
- Support for multiple LLM providers (OpenAI, Anthropic Claude, Google Gemini)
- Typing indicators and loading states
- Input validation and error handling
- Session management via localStorage

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| LLM | OpenAI / Anthropic / Google Gemini |

## Project Structure

```
spur-chat/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment config and prompts
│   │   ├── controllers/     # HTTP request handlers
│   │   ├── db/              # Database schema and migrations
│   │   ├── middleware/      # Express middleware
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   │   └── llm/         # LLM provider implementations
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Utilities (logger, errors)
│   │   └── index.ts         # Application entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Getting Started

### Prerequisites

- Node. js 18+
- A PostgreSQL database (Neon recommended)
- API key for at least one LLM provider

### 1. Clone the Repository

```bash
git clone https://github.com/arunrawat404/spur-chat.git
cd spur-chat
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```properties
# Server
NODE_ENV=development
PORT=4000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host. neon.tech/database? sslmode=require

# LLM Provider (choose:  openai, anthropic, or gemini)
LLM_PROVIDER=gemini

# API Keys (only one required based on LLM_PROVIDER)
OPENAI_API_KEY=sk-... 
ANTHROPIC_API_KEY=sk-ant-... 
GEMINI_API_KEY=... 

# Model Names (optional - defaults shown)
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
GEMINI_MODEL=gemini-2.5-flash

# CORS
CORS_ORIGIN=http://localhost:5173
```

Run database migrations:

```bash
npm run migrate
```

Start the backend:

```bash
npm run dev
```

Backend will be running at `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```properties
VITE_API_URL=http://localhost:4000/api/v1/chat
```

Start the frontend:

```bash
npm run dev
```

Frontend will be running at `http://localhost:5173`

## API Endpoints

### Health Check

```
GET /api/v1/health
```

### Send Message

```
POST /api/v1/chat/message
Content-Type:  application/json

{
  "message": "What is your return policy?",
  "sessionId": "optional-uuid"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "reply": "We offer a 30-day return window.. .",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Get Conversation History

```
GET /api/v1/chat/history/:sessionId
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "messages": [
      {
        "id": ".. .",
        "sender": "user",
        "text": "What is your return policy? ",
        "createdAt": "2025-12-29T10:00:00.000Z"
      },
      {
        "id": ".. .",
        "sender": "ai",
        "text": "We offer a 30-day return window.. .",
        "createdAt": "2025-12-29T10:00:01.000Z"
      }
    ]
  }
}
```

## Database Schema

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Architecture Overview

### Backend Layers

```
Request → Controller → Service → Repository → Database
                          ↓
                    LLM Provider
```

| Layer | Responsibility |
|-------|----------------|
| **Controllers** | Handle HTTP requests, validate input, return responses |
| **Services** | Business logic, orchestrate between repository and LLM |
| **Repositories** | Data access, database queries |
| **LLM Providers** | Abstract LLM API calls behind common interface |

### LLM Provider Abstraction

All LLM providers implement a common interface, making it easy to switch providers:

```typescript
interface LLMProvider {
    generateReply(history: LLMMessage[], userMessage: string): Promise<LLMResponse>;
}
```

To add a new provider: 
1. Create a new class extending `BaseLLMProvider`
2. Implement `generateReply()` method
3. Add to factory switch statement

### Key Design Decisions

1. **Provider Pattern for LLM**:  Easy to swap between OpenAI/Anthropic/Gemini via environment variable
2. **Repository Pattern**: Database logic isolated from business logic
3. **Session-based Conversations**: No auth required, sessions stored in localStorage
4. **Graceful Error Handling**: LLM failures return user-friendly messages instead of crashing

## LLM Integration

### Supported Providers

| Provider | Model(Default) | Environment Variable |
|----------|-------|---------------------|
| OpenAI | gpt-4o-mini | `OPENAI_API_KEY` |
| Anthropic | claude-3-5-sonnet-latest | `ANTHROPIC_API_KEY` |
| Google Gemini | gemini-2.5-flash | `GEMINI_API_KEY` |

### System Prompt

The AI is configured as a support agent for Spur with knowledge about: 

- Product offerings (AI agents, WhatsApp automation, integrations)
- Pricing plans (Starter, Growth, Business, Enterprise)
- Support hours and contact information
- Common FAQs about channels, integrations, billing

### Conversation Context

- Last 20 messages are included in each request for context
- Messages over 4000 characters are truncated
- Max response tokens capped at 1000

## Robustness Features

| Feature | Implementation |
|---------|----------------|
| Empty message validation | Zod schema validation |
| Long message handling | Truncated to 4000 chars |
| LLM error handling | Returns friendly error message |
| Invalid session handling | Returns empty history, clears localStorage |
| CORS | Configurable allowed origins |

## Trade-offs & Limitations

1. **No Authentication**: Sessions identified by UUID only.  In production, would add user auth. 

2. **No WebSocket**:  Uses request/response.  Real-time typing indicators would need WebSocket. 

3. **No Caching**: Each request hits the database. Redis caching would help at scale.

4. **Single Region**: Database in one region. Multi-region would reduce latency globally.

## If I Had More Time... 

- [ ] **Streaming Responses**: Stream LLM output for better UX on long responses
- [ ] **WebSocket Support**: Real-time message delivery and typing indicators
- [ ] **Redis Caching**: Cache active conversations
- [ ] **Rate Limiting**: Prevent abuse
- [ ] **Docker**:  Containerize for easier deployment
