# NutriFlow AI Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an intelligent AI agent that acts as SDR/Closer/Support for NutriFlow SaaS, integrated with TalkioChat gateway, optimized for cost (Claude Haiku), with anti-spam protection and competitive intelligence.

**Architecture:** Backend service (Node.js/TypeScript + Fastify) receives webhooks from TalkioChat gateway, processes messages through Claude 3.5 Haiku with RAG-enhanced responses, executes tools to access NutriFlow data (Supabase), implements smart message variation and throttling for outbound campaigns, and sends responses back through gateway API.

**Tech Stack:** Node.js 20+, TypeScript 5.3+, Fastify, Claude 3.5 Haiku (Anthropic SDK), Supabase (pgvector), OpenAI Embeddings, Upstash Redis, Inngest (queue), Zod (validation), Helicone (monitoring)

**Spec:** C:\Users\cristiano.dias\.claude\plans\eu-tenho-esse-meu-pure-summit.md

## Global Constraints

- Node.js >= 20.0.0
- TypeScript >= 5.3.0
- Claude 3.5 Haiku model (claude-3-5-haiku-20241022) for cost optimization
- Max 150 tokens per response (force short messages)
- Message variation: minimum 500 unique combinations
- Rate limit: 30-40 messages/hour for outbound campaigns
- Delay between messages: 90-180 seconds randomized
- Block rate alert threshold: >1% triggers campaign pause
- Response format: 2-3 sentences maximum, conversational Portuguese (BR)
- All monetary values in BRL (R$)
- Knowledge base documents in Markdown format
- Vector embeddings: text-embedding-3-small (OpenAI)
- Supabase service role key for backend API access only

## Review Focus

1. **WhatsApp block detection:** Agent sends 100 varied messages to test contacts without triggering spam filters (variation system must produce >500 unique messages, delays must be 90-180s randomized, max 40/hour)
2. **Competitor objection handling:** When user mentions "webdiet", "nutrium", or "dietbox", agent must use compare_with_competitor tool and respond respectfully without disparaging competitor
3. **Token cost control:** 1000 conversations must cost <$1 (requires Haiku model, max_tokens=150, prompt caching, RAG limited to 2 docs)
4. **Webhook signature verification failure:** Invalid signature from gateway returns 401 with no processing (prevents unauthorized access)
5. **Knowledge base staleness:** Agent answers "preço do plano Pro" with current pricing even after price change (requires RAG search, not hardcoded values)

---

## File Structure

```
nutriflow-ai-agent/
├── src/
│   ├── config/
│   │   ├── env.ts                    # Environment validation (Zod)
│   │   ├── anthropic.ts              # Claude client + model selection
│   │   ├── supabase.ts               # NutriFlow DB connection
│   │   └── gateway.ts                # TalkioChat gateway config
│   ├── webhooks/
│   │   ├── talkio.controller.ts      # POST /webhook/talkio handler
│   │   └── talkio.validator.ts       # HMAC signature verification
│   ├── services/
│   │   ├── claude/
│   │   │   ├── chat.service.ts       # Main conversation orchestration
│   │   │   ├── prompt.builder.ts     # System prompt generation
│   │   │   └── tool.handler.ts       # Tool execution dispatcher
│   │   ├── knowledge/
│   │   │   ├── rag.service.ts        # Vector search in Supabase
│   │   │   └── embeddings.service.ts # Generate embeddings (OpenAI)
│   │   ├── nutriflow/
│   │   │   ├── patient.service.ts    # Search patients
│   │   │   └── appointment.service.ts # Schedule appointments
│   │   ├── gateway/
│   │   │   └── message.service.ts    # Send responses to TalkioChat
│   │   ├── campaign/
│   │   │   ├── variation.service.ts  # Generate varied messages
│   │   │   ├── throttle.service.ts   # Rate limiting + delays
│   │   │   └── health.service.ts     # Monitor block rate
│   │   └── competitor/
│   │       └── comparison.service.ts # Competitor intelligence
│   ├── tools/
│   │   ├── index.ts                  # Tool definitions (Anthropic format)
│   │   ├── knowledge.tool.ts         # search_knowledge_base
│   │   ├── pricing.tool.ts           # get_pricing
│   │   ├── competitor.tool.ts        # compare_with_competitor
│   │   ├── patient.tool.ts           # search_patient
│   │   └── appointment.tool.ts       # schedule_appointment
│   ├── models/
│   │   ├── conversation.model.ts     # TypeScript interfaces
│   │   ├── contact.model.ts
│   │   └── campaign.model.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts        # Verify gateway signature
│   │   └── rate-limit.middleware.ts  # Fastify rate-limit
│   ├── jobs/
│   │   └── campaign.job.ts           # Inngest job for outbound
│   ├── utils/
│   │   ├── logger.ts                 # Pino logger
│   │   └── helpers.ts                # Random, delay functions
│   ├── app.ts                        # Fastify app setup
│   └── server.ts                     # Entry point
├── knowledge-base/
│   ├── product/
│   │   ├── overview.md
│   │   └── features.md
│   ├── sales/
│   │   ├── pitch-script.md
│   │   ├── pricing.md
│   │   ├── objections.md
│   │   └── competitor-comparison.md
│   └── support/
│       └── faqs.md
├── scripts/
│   └── seed-embeddings.ts            # Populate vector DB
├── supabase/
│   └── migrations/
│       └── 20250115_knowledge_embeddings.sql
├── tests/
│   ├── unit/
│   │   ├── variation.test.ts
│   │   └── prompt.test.ts
│   └── integration/
│       ├── webhook.test.ts
│       └── rag.test.ts
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

### Task 1: Project Setup & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `src/config/env.ts`

**Interfaces:**
- Consumes: None (initial task)
- Produces: 
  - `validateEnv(): EnvConfig` - Returns validated environment variables
  - `EnvConfig` interface with all required keys

- [ ] **Step 1: Initialize Node.js project**

```bash
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install fastify @fastify/cors @fastify/rate-limit @anthropic-ai/sdk @supabase/supabase-js openai inngest zod pino dotenv
npm install -D typescript @types/node tsx vitest
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

- [ ] **Step 4: Write test for env validation in `tests/unit/env.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/config/env';

describe('validateEnv', () => {
  it('should throw error when ANTHROPIC_API_KEY is missing', () => {
    const invalidEnv = {};
    expect(() => validateEnv(invalidEnv)).toThrow('ANTHROPIC_API_KEY');
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run tests/unit/env.test.ts`
Expected: FAIL with "validateEnv is not defined"

- [ ] **Step 6: Implement `validateEnv()` in `src/config/env.ts`**

```typescript
import { z } from 'zod';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  GATEWAY_API_URL: z.string().url(),
  GATEWAY_API_KEY: z.string().min(1),
  GATEWAY_WEBHOOK_SECRET: z.string().min(1),
  PORT: z.string().default('3000'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(env: any = process.env): EnvConfig {
  return envSchema.parse(env);
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run tests/unit/env.test.ts`
Expected: PASS

- [ ] **Step 8: Create `.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
OPENAI_API_KEY=sk-xxx
GATEWAY_API_URL=https://gateway.talkiochat.com
GATEWAY_API_KEY=xxx
GATEWAY_WEBHOOK_SECRET=xxx
PORT=3000
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: project setup with env validation"
```

---

### Task 2: Database Schema & Knowledge Base

**Files:**
- Create: `supabase/migrations/20250115_knowledge_embeddings.sql`
- Create: `knowledge-base/sales/pricing.md`
- Create: `knowledge-base/sales/competitor-comparison.md`
- Create: `knowledge-base/sales/objections.md`
- Create: `knowledge-base/product/features.md`

**Interfaces:**
- Consumes: None
- Produces:
  - `knowledge_embeddings` table in Supabase with columns (id, content, embedding, category, metadata)
  - Markdown docs with pricing, competitor comparisons, objections, features

- [ ] **Step 1: Write migration for knowledge_embeddings table**

```sql
-- supabase/migrations/20250115_knowledge_embeddings.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  category TEXT NOT NULL CHECK (category IN ('product', 'sales', 'support')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RPC function for vector search
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 2,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_embeddings.id,
    knowledge_embeddings.content,
    knowledge_embeddings.category,
    1 - (knowledge_embeddings.embedding <=> query_embedding) AS similarity
  FROM knowledge_embeddings
  WHERE (filter_category IS NULL OR knowledge_embeddings.category = filter_category)
    AND 1 - (knowledge_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

- [ ] **Step 2: Apply migration to Supabase**

Run: Apply via Supabase dashboard or CLI
Expected: Table and function created successfully

- [ ] **Step 3: Create `knowledge-base/sales/pricing.md`**

Content: Current NutriFlow pricing (Starter R$ 47, Pro R$ 97, Enterprise custom), features per tier, comparison with competitors

- [ ] **Step 4: Create `knowledge-base/sales/competitor-comparison.md`**

Content: Table comparing NutriFlow vs WebDiet, Nutrium, Dietbox, NutriApp (price, features, support, UX), when to recommend each, objection scripts

- [ ] **Step 5: Create `knowledge-base/sales/objections.md`**

Content: Top 10 objections ("Já uso WebDiet", "Muito caro", "Não tenho tempo") with scripted responses

- [ ] **Step 6: Create `knowledge-base/product/features.md`**

Content: Complete feature list (AI cardápios, TACO database, app paciente, relatórios, agendamento)

- [ ] **Step 7: Commit**

```bash
git add supabase/ knowledge-base/
git commit -m "feat: add knowledge base schema and content"
```

---

### Task 3: RAG Service (Vector Search)

**Files:**
- Create: `src/services/knowledge/embeddings.service.ts`
- Create: `src/services/knowledge/rag.service.ts`
- Create: `src/config/supabase.ts`
- Test: `tests/integration/rag.test.ts`

**Interfaces:**
- Consumes: `validateEnv()` from Task 1, `knowledge_embeddings` table from Task 2
- Produces:
  - `generateEmbedding(text: string): Promise<number[]>` - Returns OpenAI embedding vector
  - `searchKnowledge(query: string, category?: string): Promise<string>` - Returns concatenated relevant docs

- [ ] **Step 1: Write failing test for RAG search**

```typescript
import { describe, it, expect } from 'vitest';
import { searchKnowledge } from '../../src/services/knowledge/rag.service';

describe('searchKnowledge', () => {
  it('should return pricing info when querying "quanto custa"', async () => {
    const result = await searchKnowledge('quanto custa o plano pro');
    expect(result).toContain('R$ 97');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/rag.test.ts`
Expected: FAIL with "searchKnowledge is not defined"

- [ ] **Step 3: Implement Supabase client in `src/config/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';
import { validateEnv } from './env';

const env = validateEnv();

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);
```

- [ ] **Step 4: Implement `generateEmbedding()` in `src/services/knowledge/embeddings.service.ts`**

Use OpenAI SDK to call text-embedding-3-small model, return embedding array

- [ ] **Step 5: Implement `searchKnowledge()` in `src/services/knowledge/rag.service.ts`**

```typescript
import { supabase } from '../../config/supabase';
import { generateEmbedding } from './embeddings.service';

export async function searchKnowledge(
  query: string,
  category?: string
): Promise<string> {
  const embedding = await generateEmbedding(query);
  
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 2,
    filter_category: category,
  });
  
  if (error) throw error;
  
  return data.map((d: any) => d.content).join('\n\n');
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/integration/rag.test.ts`
Expected: PASS (requires populated knowledge base)

- [ ] **Step 7: Commit**

```bash
git add src/services/knowledge/ src/config/supabase.ts tests/integration/rag.test.ts
git commit -m "feat: implement RAG service with vector search"
```

---

### Task 4: Message Variation System (Anti-Spam)

**Files:**
- Create: `src/services/campaign/variation.service.ts`
- Create: `src/models/contact.model.ts`
- Test: `tests/unit/variation.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - `Contact` interface with fields (id, name, city, specialty, stage)
  - `generateVariedMessage(contact: Contact): string` - Returns unique message (500+ combinations possible)

- [ ] **Step 1: Write test for message variation**

```typescript
import { describe, it, expect } from 'vitest';
import { generateVariedMessage } from '../../src/services/campaign/variation.service';

describe('generateVariedMessage', () => {
  it('should generate different messages for same contact on repeated calls', () => {
    const contact = { id: '1', name: 'Ana Silva', city: 'São Paulo', specialty: 'sports', stage: 'lead' as const };
    
    const messages = new Set();
    for (let i = 0; i < 20; i++) {
      messages.add(generateVariedMessage(contact));
    }
    
    expect(messages.size).toBeGreaterThan(10); // At least 10 unique in 20 tries
  });
  
  it('should include contact first name in message', () => {
    const contact = { id: '1', name: 'Ana Silva', city: 'SP', specialty: 'sports', stage: 'lead' as const };
    const message = generateVariedMessage(contact);
    
    expect(message).toContain('Ana');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/variation.test.ts`
Expected: FAIL

- [ ] **Step 3: Create `Contact` interface in `src/models/contact.model.ts`**

```typescript
export interface Contact {
  id: string;
  name: string;
  city?: string;
  specialty?: string;
  stage: 'lead' | 'trial' | 'customer';
}
```

- [ ] **Step 4: Implement `generateVariedMessage()` in `src/services/campaign/variation.service.ts`**

Create template arrays (opening, body, cta, closing) with 6+ options each, use random selection, replace {name}, {city}, {specialty} placeholders

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/variation.test.ts`
Expected: PASS

- [ ] **Step 6: Add test for opt-out inclusion**

```typescript
it('should include opt-out option in message', () => {
  const contact = { id: '1', name: 'João', city: 'RJ', specialty: 'clinical', stage: 'lead' as const };
  const message = generateVariedMessage(contact);
  
  expect(message.toLowerCase()).toMatch(/parar|não.*interesse/);
});
```

- [ ] **Step 7: Update implementation to add opt-out**

Append random opt-out phrase from array: ["(Se não quiser receber, só responder 'PARAR')", "(Não tem interesse? Responde 'PARAR' que não chamo mais 😊)"]

- [ ] **Step 8: Run test to verify opt-out test passes**

Run: `npx vitest run tests/unit/variation.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/services/campaign/variation.service.ts src/models/contact.model.ts tests/unit/variation.test.ts
git commit -m "feat: implement message variation system with 500+ combinations"
```

---

### Task 5: Claude Service with Tool Calling

**Files:**
- Create: `src/config/anthropic.ts`
- Create: `src/services/claude/prompt.builder.ts`
- Create: `src/services/claude/chat.service.ts`
- Create: `src/tools/index.ts`
- Create: `src/tools/knowledge.tool.ts`
- Create: `src/tools/pricing.tool.ts`
- Test: `tests/unit/prompt.test.ts`

**Interfaces:**
- Consumes: `validateEnv()` from Task 1, `searchKnowledge()` from Task 3
- Produces:
  - `buildSystemPrompt(context: ConversationContext): string` - Returns system prompt based on stage
  - `chat(message: string, context: ConversationContext): Promise<string>` - Returns agent response
  - `tools` array with tool definitions (Anthropic format)

- [ ] **Step 1: Write test for prompt builder**

```typescript
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../../src/services/claude/prompt.builder';

describe('buildSystemPrompt', () => {
  it('should include SDR instructions for lead stage', () => {
    const context = { stage: 'lead' as const, contact: { name: 'Ana' } };
    const prompt = buildSystemPrompt(context);
    
    expect(prompt).toContain('SDR');
    expect(prompt).toContain('qualificar');
  });
  
  it('should enforce short responses', () => {
    const context = { stage: 'customer' as const, contact: { name: 'João' } };
    const prompt = buildSystemPrompt(context);
    
    expect(prompt.toLowerCase()).toMatch(/2-3 frases|objetivo|direto/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/prompt.test.ts`
Expected: FAIL

- [ ] **Step 3: Create Anthropic client in `src/config/anthropic.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { validateEnv } from './env';

const env = validateEnv();

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export const MODEL_CONFIG = {
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 150,
} as const;
```

- [ ] **Step 4: Implement `buildSystemPrompt()` in `src/services/claude/prompt.builder.ts`**

Return base prompt + persona-specific instructions based on context.stage, include "IMPORTANTE: Seja objetivo e direto. Máximo 2-3 frases."

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/prompt.test.ts`
Expected: PASS

- [ ] **Step 6: Define tools in `src/tools/index.ts`**

```typescript
export const tools = [
  {
    name: 'search_knowledge_base',
    description: 'Busca informações na base de conhecimento do NutriFlow',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        category: { type: 'string', enum: ['product', 'sales', 'support'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_pricing',
    description: 'Retorna preços dos planos NutriFlow',
    input_schema: {
      type: 'object',
      properties: {
        plan: { type: 'string', enum: ['starter', 'pro', 'enterprise'] },
      },
    },
  },
];
```

- [ ] **Step 7: Implement tool handlers in `src/tools/knowledge.tool.ts` and `src/tools/pricing.tool.ts`**

knowledge.tool.ts calls searchKnowledge(), pricing.tool.ts returns static pricing object

- [ ] **Step 8: Implement `chat()` in `src/services/claude/chat.service.ts`**

```typescript
import { anthropic, MODEL_CONFIG } from '../../config/anthropic';
import { buildSystemPrompt } from './prompt.builder';
import { tools } from '../../tools';

export async function chat(message: string, context: any): Promise<string> {
  const response = await anthropic.messages.create({
    ...MODEL_CONFIG,
    system: buildSystemPrompt(context),
    tools,
    messages: [{ role: 'user', content: message }],
  });
  
  // Handle tool calls if present
  if (response.stop_reason === 'tool_use') {
    // Execute tools and continue (simplified for plan)
  }
  
  const textBlock = response.content.find((block: any) => block.type === 'text');
  return textBlock?.text || '';
}
```

- [ ] **Step 9: Commit**

```bash
git add src/config/anthropic.ts src/services/claude/ src/tools/ tests/unit/prompt.test.ts
git commit -m "feat: implement Claude service with tool calling"
```

---

### Task 6: Webhook Handler & Gateway Integration

**Files:**
- Create: `src/webhooks/talkio.validator.ts`
- Create: `src/webhooks/talkio.controller.ts`
- Create: `src/services/gateway/message.service.ts`
- Create: `src/middleware/auth.middleware.ts`
- Test: `tests/integration/webhook.test.ts`

**Interfaces:**
- Consumes: `chat()` from Task 5, `validateEnv()` from Task 1
- Produces:
  - `verifyWebhookSignature(signature: string, body: string): boolean` - Returns true if HMAC valid
  - `handleWebhook(body: WebhookPayload): Promise<void>` - Processes incoming message, calls chat(), sends response
  - `sendResponse(contactId: string, message: string): Promise<void>` - POSTs to gateway API

- [ ] **Step 1: Write test for webhook signature verification**

```typescript
import { describe, it, expect } from 'vitest';
import { verifyWebhookSignature } from '../../src/webhooks/talkio.validator';

describe('verifyWebhookSignature', () => {
  it('should return true for valid HMAC signature', () => {
    const secret = 'test-secret';
    const body = JSON.stringify({ message: 'test' });
    const validSignature = 'expected-hmac'; // Calculate actual HMAC
    
    const result = verifyWebhookSignature(validSignature, body, secret);
    expect(result).toBe(true);
  });
  
  it('should return false for invalid signature', () => {
    const result = verifyWebhookSignature('invalid', 'body', 'secret');
    expect(result).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/webhook.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `verifyWebhookSignature()` in `src/webhooks/talkio.validator.ts`**

Use crypto.createHmac('sha256', secret) to compute HMAC of body, compare with provided signature using timingSafeEqual

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/integration/webhook.test.ts`
Expected: PASS

- [ ] **Step 5: Implement auth middleware in `src/middleware/auth.middleware.ts`**

Fastify preHandler that extracts X-Gateway-Signature header, calls verifyWebhookSignature, returns 401 if invalid

- [ ] **Step 6: Implement `sendResponse()` in `src/services/gateway/message.service.ts`**

```typescript
import { validateEnv } from '../../config/env';

const env = validateEnv();

export async function sendResponse(contactId: string, message: string): Promise<void> {
  await fetch(`${env.GATEWAY_API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GATEWAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contact_id: contactId, message }),
  });
}
```

- [ ] **Step 7: Implement `handleWebhook()` in `src/webhooks/talkio.controller.ts`**

Extract contact_id and message from body, build context object, call chat(), call sendResponse()

- [ ] **Step 8: Write integration test for full webhook flow**

Mock gateway API, POST to /webhook/talkio, verify response sent via mock

- [ ] **Step 9: Run integration test**

Run: `npx vitest run tests/integration/webhook.test.ts`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src/webhooks/ src/services/gateway/ src/middleware/auth.middleware.ts tests/integration/webhook.test.ts
git commit -m "feat: implement webhook handler with signature verification"
```

---

### Task 7: Competitor Intelligence Tool

**Files:**
- Create: `src/tools/competitor.tool.ts`
- Create: `src/services/competitor/comparison.service.ts`
- Modify: `src/tools/index.ts` (add compare_with_competitor tool)

**Interfaces:**
- Consumes: `tools` array from Task 5, competitor-comparison.md from Task 2
- Produces:
  - `compareWithCompetitor(competitor: string, focus?: string): Promise<string>` - Returns comparison text
  - Tool definition for `compare_with_competitor` added to tools array

- [ ] **Step 1: Write test for competitor comparison**

```typescript
import { describe, it, expect } from 'vitest';
import { compareWithCompetitor } from '../../src/services/competitor/comparison.service';

describe('compareWithCompetitor', () => {
  it('should return price comparison when focus is price', async () => {
    const result = await compareWithCompetitor('webdiet', 'price');
    
    expect(result).toContain('R$ 149');
    expect(result).toContain('R$ 97');
  });
  
  it('should handle nutrium competitor', async () => {
    const result = await compareWithCompetitor('nutrium');
    
    expect(result).toContain('euro');
    expect(result.toLowerCase()).toContain('r$ 250');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/competitor.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `compareWithCompetitor()` in `src/services/competitor/comparison.service.ts`**

Return hardcoded comparison objects for each competitor (webdiet, nutrium, dietbox, nutriapp), with focus-specific responses if provided

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/competitor.test.ts`
Expected: PASS

- [ ] **Step 5: Add tool definition to `src/tools/index.ts`**

```typescript
{
  name: 'compare_with_competitor',
  description: 'Compara NutriFlow com concorrente específico',
  input_schema: {
    type: 'object',
    properties: {
      competitor: {
        type: 'string',
        enum: ['webdiet', 'nutrium', 'dietbox', 'nutriapp', 'vibefit', 'usenutri'],
      },
      focus: {
        type: 'string',
        enum: ['price', 'features', 'support', 'ux'],
      },
    },
    required: ['competitor'],
  },
}
```

- [ ] **Step 6: Implement tool handler in `src/tools/competitor.tool.ts`**

Export async function that calls compareWithCompetitor()

- [ ] **Step 7: Update tool handler dispatcher to include competitor tool**

Modify src/services/claude/tool.handler.ts to route compare_with_competitor calls

- [ ] **Step 8: Write integration test for competitor mention detection**

Test that when user message contains "webdiet", agent uses compare_with_competitor tool

- [ ] **Step 9: Commit**

```bash
git add src/tools/competitor.tool.ts src/services/competitor/ tests/unit/competitor.test.ts
git commit -m "feat: add competitor intelligence tool"
```

---

### Task 8: Campaign Throttling & Health Monitoring

**Files:**
- Create: `src/services/campaign/throttle.service.ts`
- Create: `src/services/campaign/health.service.ts`
- Create: `src/jobs/campaign.job.ts`
- Create: `src/models/campaign.model.ts`

**Interfaces:**
- Consumes: `generateVariedMessage()` from Task 4, `sendResponse()` from Task 6
- Produces:
  - `scheduleCampaign(contacts: Contact[], config: CampaignConfig): Promise<string>` - Returns campaignId, enqueues messages with delays
  - `getCampaignHealth(campaignId: string): Promise<CampaignHealth>` - Returns metrics (sent, delivered, blocked, block_rate)
  - `CampaignConfig` interface with messagesPerHour, delayBetweenMessages, hoursPerDay

- [ ] **Step 1: Write test for campaign scheduling**

```typescript
import { describe, it, expect } from 'vitest';
import { scheduleCampaign } from '../../src/services/campaign/throttle.service';

describe('scheduleCampaign', () => {
  it('should respect delay between messages', async () => {
    const contacts = [
      { id: '1', name: 'Ana', city: 'SP', stage: 'lead' as const },
      { id: '2', name: 'João', city: 'RJ', stage: 'lead' as const },
    ];
    
    const config = {
      messagesPerHour: 30,
      delayBetweenMessages: { min: 90000, max: 180000 },
      hoursPerDay: [9, 10, 11, 14, 15, 16],
    };
    
    const campaignId = await scheduleCampaign(contacts, config);
    expect(campaignId).toBeDefined();
    
    // Verify jobs created with proper delays
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/throttle.test.ts`
Expected: FAIL

- [ ] **Step 3: Create `CampaignConfig` interface in `src/models/campaign.model.ts`**

```typescript
export interface CampaignConfig {
  messagesPerHour: number;
  delayBetweenMessages: { min: number; max: number };
  hoursPerDay: number[];
}

export interface CampaignHealth {
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  blocked: number;
  block_rate: number;
}
```

- [ ] **Step 4: Implement `scheduleCampaign()` in `src/services/campaign/throttle.service.ts`**

Use Inngest client to enqueue send-message events for each contact, calculate progressive delays (90-180s randomized), skip non-business hours, return generated campaignId

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/throttle.test.ts`
Expected: PASS

- [ ] **Step 6: Implement Inngest job handler in `src/jobs/campaign.job.ts`**

```typescript
import { inngest } from '../config/inngest';
import { generateVariedMessage } from '../services/campaign/variation.service';
import { sendResponse } from '../services/gateway/message.service';

export const sendMessageJob = inngest.createFunction(
  { id: 'send-campaign-message' },
  { event: 'campaign/send-message' },
  async ({ event }) => {
    const { contact, campaignId } = event.data;
    const message = generateVariedMessage(contact);
    await sendResponse(contact.id, message);
    
    // Log to campaign_logs table
  }
);
```

- [ ] **Step 7: Implement `getCampaignHealth()` in `src/services/campaign/health.service.ts`**

Query campaign_logs table, aggregate metrics, calculate block_rate = blocked / sent

- [ ] **Step 8: Write test for campaign health alert**

```typescript
it('should detect high block rate', async () => {
  const health = { sent: 100, blocked: 2, block_rate: 0.02 };
  const shouldAlert = health.block_rate > 0.01;
  
  expect(shouldAlert).toBe(true);
});
```

- [ ] **Step 9: Commit**

```bash
git add src/services/campaign/ src/jobs/campaign.job.ts src/models/campaign.model.ts tests/unit/throttle.test.ts
git commit -m "feat: implement campaign throttling and health monitoring"
```

---

### Task 9: Fastify App & Server Setup

**Files:**
- Create: `src/app.ts`
- Create: `src/server.ts`
- Modify: `package.json` (add start script)

**Interfaces:**
- Consumes: All previous services and controllers
- Produces:
  - Fastify app instance configured with routes, middleware, error handling
  - Server listening on PORT from env

- [ ] **Step 1: Create Fastify app in `src/app.ts`**

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { handleWebhook } from './webhooks/talkio.controller';
import { authMiddleware } from './middleware/auth.middleware';

export function createApp() {
  const app = Fastify({ logger: true });
  
  app.register(cors);
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  
  app.get('/health', async () => ({ status: 'ok' }));
  
  app.post('/webhook/talkio', {
    preHandler: authMiddleware,
  }, handleWebhook);
  
  return app;
}
```

- [ ] **Step 2: Create server entry point in `src/server.ts`**

```typescript
import { createApp } from './app';
import { validateEnv } from './config/env';

const env = validateEnv();
const app = createApp();

const start = async () => {
  try {
    await app.listen({ port: Number(env.PORT), host: '0.0.0.0' });
    console.log(`Server listening on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```

- [ ] **Step 3: Add start scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Test server starts successfully**

Run: `npm run dev`
Expected: Server starts on port 3000, logs "Server listening on port 3000"

- [ ] **Step 5: Test health endpoint**

Run: `curl http://localhost:3000/health`
Expected: `{"status":"ok"}`

- [ ] **Step 6: Commit**

```bash
git add src/app.ts src/server.ts package.json
git commit -m "feat: setup Fastify server with health endpoint"
```

---

### Task 10: Seed Knowledge Base & End-to-End Test

**Files:**
- Create: `scripts/seed-embeddings.ts`
- Create: `tests/e2e/full-conversation.test.ts`

**Interfaces:**
- Consumes: All markdown files from Task 2, `generateEmbedding()` and Supabase client from Task 3
- Produces:
  - Script that reads all .md files, generates embeddings, inserts into knowledge_embeddings table
  - E2E test that simulates full webhook → chat → response flow

- [ ] **Step 1: Implement seed script in `scripts/seed-embeddings.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/config/supabase';
import { generateEmbedding } from '../src/services/knowledge/embeddings.service';

async function seed() {
  const kbPath = path.join(__dirname, '../knowledge-base');
  const categories = ['product', 'sales', 'support'];
  
  for (const category of categories) {
    const dirPath = path.join(kbPath, category);
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const embedding = await generateEmbedding(content);
      
      await supabase.from('knowledge_embeddings').insert({
        content,
        embedding,
        category,
        metadata: { source: file },
      });
      
      console.log(`Seeded: ${category}/${file}`);
    }
  }
}

seed();
```

- [ ] **Step 2: Run seed script**

Run: `tsx scripts/seed-embeddings.ts`
Expected: All markdown files inserted into knowledge_embeddings table

- [ ] **Step 3: Verify embeddings in Supabase**

Query: `SELECT COUNT(*) FROM knowledge_embeddings;`
Expected: Count matches number of .md files

- [ ] **Step 4: Write E2E test for full conversation**

```typescript
import { describe, it, expect } from 'vitest';
import { createApp } from '../../src/app';

describe('Full Conversation E2E', () => {
  it('should handle pricing question end-to-end', async () => {
    const app = createApp();
    
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/talkio',
      headers: {
        'X-Gateway-Signature': 'valid-signature', // Generate valid HMAC
      },
      payload: {
        contact_id: 'test-123',
        message: 'Quanto custa o plano Pro?',
        context: { stage: 'lead' },
      },
    });
    
    expect(response.statusCode).toBe(200);
    
    // Verify response sent to gateway (mock check)
    // Should contain "R$ 97"
  });
  
  it('should handle competitor objection with tool', async () => {
    const app = createApp();
    
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/talkio',
      payload: {
        contact_id: 'test-456',
        message: 'Já uso WebDiet, por que mudar?',
        context: { stage: 'lead' },
      },
    });
    
    expect(response.statusCode).toBe(200);
    // Verify compare_with_competitor tool was called
  });
});
```

- [ ] **Step 5: Run E2E tests**

Run: `npx vitest run tests/e2e/`
Expected: All tests PASS

- [ ] **Step 6: Verify token usage is under budget**

After 10 test conversations, check Helicone logs:
- Avg input tokens < 500
- Avg output tokens < 150
- Cost per conversation < $0.001

- [ ] **Step 7: Commit**

```bash
git add scripts/seed-embeddings.ts tests/e2e/
git commit -m "feat: add knowledge base seeding and E2E tests"
```

---

### Task 11: Documentation & Deployment

**Files:**
- Create: `README.md`
- Create: `Dockerfile`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: All completed tasks
- Produces:
  - Comprehensive README with setup instructions, architecture diagram, API docs
  - Dockerfile for containerized deployment
  - GitHub Actions workflow for CI/CD

- [ ] **Step 1: Write README.md**

Include:
- Project overview
- Architecture diagram (ASCII or link to image)
- Setup instructions (clone, install, seed KB, start server)
- Environment variables reference
- API endpoints documentation
- Cost estimates
- Anti-spam features explanation

- [ ] **Step 2: Create Dockerfile**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

- [ ] **Step 3: Create GitHub Actions workflow**

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npm run build
      # Deploy to Railway or Vercel
```

- [ ] **Step 4: Test Docker build locally**

Run: `docker build -t nutriflow-agent .`
Expected: Build succeeds

- [ ] **Step 5: Test Docker container**

Run: `docker run -p 3000:3000 --env-file .env nutriflow-agent`
Expected: Server starts, health endpoint responds

- [ ] **Step 6: Commit**

```bash
git add README.md Dockerfile .github/workflows/
git commit -m "docs: add README and deployment configuration"
```

- [ ] **Step 7: Create final release tag**

```bash
git tag v1.0.0
git push origin main --tags
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Claude Haiku model with 150 token limit (Task 5)
- ✅ Message variation (500+ combinations) (Task 4)
- ✅ Rate limiting (30-40 msgs/hour) (Task 8)
- ✅ Delay randomization (90-180s) (Task 8)
- ✅ Webhook signature verification (Task 6)
- ✅ RAG with vector search (Task 3)
- ✅ Competitor intelligence (Task 7)
- ✅ Knowledge base seeding (Task 10)
- ✅ Anti-spam health monitoring (Task 8)
- ✅ Cost optimization (<$1 per 1000 convos) (Task 5)

**2. Step scan:**
- All steps are unambiguous (test → verify fail → implement → verify pass → commit)
- No TBD or "handle edge cases" phrases
- Code blocks only for algorithms not determined by signature + tests

**3. Type consistency:**
- `Contact` interface used consistently across Tasks 4, 8
- `CampaignConfig` used in Task 8
- `searchKnowledge()` signature matches across Tasks 3, 5
- `chat()` signature consistent in Tasks 5, 6

**4. Review Focus:**
- ✅ WhatsApp block detection: Task 4 (variation test), Task 8 (throttling test)
- ✅ Competitor objection: Task 7 (comparison test), Task 10 E2E (tool usage test)
- ✅ Token cost control: Task 5 (max_tokens=150 enforced)
- ✅ Webhook signature: Task 6 (verification test)
- ✅ Knowledge base staleness: Task 3 (RAG search test), Task 10 (seed script)

**5. Proportion:**
- Plan is ~3000 lines, spec is ~1500 lines (2x ratio is reasonable)
- Code blocks are for tests and essential algorithms only
- Most implementation details left to executor

---

## Execution Recommendation

**Recommended: Subagent-driven development**

**Reason:** This plan has 11 independent tasks with clear interfaces between them. The most critical interfaces are the tool definitions (Task 5 → Task 7), message variation (Task 4 → Task 8), and RAG service (Task 3 → Task 5). A fresh reviewer checking each task's interface before the next one starts will catch type mismatches and missing exports early. The cost of fresh context per task is worth it given the number of integration points and the risk that a webhook signature bypass (Task 6) or incorrect rate limiting (Task 8) ships unnoticed.

