# Articles Section & AI Learning Plan

## Overview

A new `/articles` route for markdown-based blog content. The series: **"How AI Works"** — a ground-up learning journey covering AI, ML, deep learning, LLMs, and production AI engineering with rich visuals (mermaid diagrams, excalidraw illustrations, charts via D3).

A developer who completes all 7 series will have both the conceptual foundations and the practical skills to work as an AI engineer — from understanding how neural networks learn, to shipping and evaluating AI systems in production.

Reference: [ByteByteAI Course](https://bytebyteai.com/) curriculum adapted into a self-paced article series.

---

## Part 1: Technical Setup — Articles Route

### Architecture

```
src/
├── app/articles/
│   ├── page.tsx                  # Articles listing page (filterable by series/tags)
│   └── [slug]/page.tsx           # Individual article page (renders MDX)
├── content/articles/             # Markdown/MDX files (organized by category slug)
│   ├── ai-fundamentals/
│   │   ├── 01-what-is-ai.mdx
│   │   ├── 02-neural-networks.mdx
│   │   └── ...
│   ├── llms/
│   │   └── ...
│   └── <any-new-category>/       # just add a folder matching the category slug
│       └── ...
├── components/articles/
│   ├── ArticleLayout.tsx         # Wrapper (TOC, reading progress, prev/next)
│   ├── ArticleCard.tsx           # Card for listing page
│   └── mdx/                     # Custom MDX components (callouts, diagrams, quiz)
│       ├── Mermaid.tsx           # Reuse existing mermaid setup
│       ├── Excalidraw.tsx        # Embed excalidraw SVGs
│       ├── Chart.tsx             # D3-based inline charts
│       ├── Callout.tsx           # Info/warning/tip boxes
│       └── Quiz.tsx              # Simple interactive quiz component
├── data/articles/
│   └── articles.json             # Article metadata index
└── styles/articles/
    └── articles.css
```

### Dependencies to Add

- `next-mdx-remote` or `@next/mdx` — MDX rendering with custom components
- `gray-matter` — frontmatter parsing
- `rehype-pretty-code` / `shiki` — syntax highlighting
- `remark-gfm` — GitHub-flavored markdown (tables, task lists)

### Category System

Categories provide top-level filtering on the articles listing page. Each article belongs to exactly one category. Categories are **dynamic** — defined in a `categories.json` config file so new categories can be added anytime without code changes.

#### Category Config (`src/data/articles/categories.json`)

```json
[
  { "slug": "ai-fundamentals", "name": "AI Fundamentals", "color": "purple", "icon": "brain" },
  { "slug": "deep-learning", "name": "Deep Learning", "color": "blue", "icon": "layers" },
  { "slug": "llms", "name": "LLMs", "color": "cyan", "icon": "message-square" },
  { "slug": "training-alignment", "name": "Training & Alignment", "color": "green", "icon": "target" },
  { "slug": "applied-ai", "name": "Applied AI", "color": "yellow", "icon": "wrench" },
  { "slug": "agents-reasoning", "name": "Agents & Reasoning", "color": "pink", "icon": "bot" },
  { "slug": "generative-ai", "name": "Generative AI", "color": "orange", "icon": "image" }
]
```

To add a new category (e.g., Web3, DevOps, Math), just add a new entry to this JSON — no code changes needed. The listing page reads from this file dynamically.

#### Initial AI Categories

| Category | Covers |
|----------|--------|
| AI Fundamentals | What is AI, ML types, neural networks, backprop |
| Deep Learning | CNNs, RNNs, architectures |
| LLMs | Transformers, tokenization, pre-training, generation |
| Training & Alignment | SFT, RLHF, LoRA, evaluation |
| Applied AI | Prompt engineering, RAG, embeddings, chatbots |
| Agents & Reasoning | AI agents, ReACT, reasoning models |
| Generative AI | Image/video generation, diffusion, multimodal |

#### Future-Ready Examples

New topics just need a category entry + markdown files:
- `{ "slug": "web-development", "name": "Web Development", "color": "cyan", "icon": "globe" }`
- `{ "slug": "devops", "name": "DevOps & Infra", "color": "green", "icon": "server" }`
- `{ "slug": "math-cs", "name": "Math & CS", "color": "blue", "icon": "calculator" }`

**Filtering**: `/articles?category=llms` or `/articles?category=applied-ai&tag=RAG`

The listing page will show:
- Category pills at the top (like the guides page tag filter)
- Clickable category badge on each article card
- URL-driven filters (category + tag combo) for shareable links

### MDX Frontmatter Schema

```yaml
---
title: "What is AI? From Rules to Learning"
slug: what-is-ai
category: ai-fundamentals        # top-level filter
series: ai-fundamentals          # reading order within a series
seriesOrder: 1
description: "..."
tags: [AI, Basics, History]      # finer-grained tags for cross-cutting topics
readTime: "8 min"
icon: "brain"
color: purple
createdAt: 2026-04-05
updatedAt: 2026-04-05
author: obydul
excalidraw: true
mermaid: true
---
```

---

## Part 2: AI Learning Curriculum — Article Series

### Series 1: AI Fundamentals (Weeks 1-2)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 1 | **What is AI? From Rules to Learning** — AI vs ML vs DL vs GenAI, brief history, why now | Mermaid: AI subset diagram, Excalidraw: timeline | DONE |
| 2 | **How Machines Learn** — supervised, unsupervised, reinforcement learning, train/test split | Excalidraw: learning types comparison, D3: bias-variance tradeoff chart | DONE |
| 3 | **Neural Networks from Scratch** — perceptron, layers, activation functions, forward pass | Excalidraw: neuron anatomy, Mermaid: network architecture, D3: activation function plots | DONE |
| 4 | **Backpropagation & Training** — loss functions, gradient descent, learning rate, epochs | Excalidraw: backprop flow, D3: loss curve animation, gradient descent landscape | DONE |
| 5 | **CNNs & Computer Vision** — convolutions, pooling, feature maps | Excalidraw: convolution operation, filter visualization | DONE |
| 6 | **RNNs & Sequential Data** — why sequence matters, vanishing gradients, LSTM/GRU | Mermaid: RNN unrolled, Excalidraw: LSTM cell gates | DONE |

### Series 2: Transformers & LLMs (Weeks 3-4)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 7 | **Attention Is All You Need** — self-attention, multi-head attention, why it replaced RNNs | Excalidraw: attention mechanism step-by-step, D3: attention heatmap | DONE |
| 8 | **The Transformer Architecture** — encoder-decoder, positional encoding, layer norm, FFN | Excalidraw: full transformer diagram (detailed), Mermaid: data flow | DONE |
| 9 | **Tokenization** — BPE, WordPiece, SentencePiece, vocabulary building | Excalidraw: tokenization process, D3: token frequency chart | DONE |
| 10 | **Pre-Training LLMs** — data collection (Common Crawl, FineWeb), cleaning, next-token prediction | Mermaid: pre-training pipeline, Excalidraw: data funnel, D3: scaling laws chart | DONE |
| 11 | **GPT, LLaMA & Model Families** — decoder-only vs encoder-decoder, model zoo, parameter counts | Mermaid: model family tree, D3: model size timeline chart | DONE |
| 12 | **Text Generation Strategies** — greedy, beam search, top-k, top-p, temperature | D3: interactive probability distribution, Excalidraw: search tree | DONE |

### Series 3: Post-Training & Alignment (Week 5)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 13 | **Supervised Fine-Tuning (SFT)** — instruction tuning, data formats, when to fine-tune | Mermaid: SFT pipeline, Excalidraw: before/after comparison | DONE |
| 14 | **RLHF & Reward Models** — human feedback loop, reward modeling, PPO, DPO | Excalidraw: RLHF loop diagram, Mermaid: training stages | DONE |
| 15 | **Efficient Fine-Tuning** — LoRA, QLoRA, adapters, PEFT | Excalidraw: LoRA weight injection, D3: parameter efficiency comparison chart | DONE |
| 16 | **Evaluation & Benchmarks** — perplexity, BLEU, human eval, MMLU, leaderboards | D3: benchmark comparison charts, Mermaid: evaluation pipeline | DONE |

### Series 4: RAG, Prompting & Applications (Week 6)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 17 | **Prompt Engineering** — zero-shot, few-shot, chain-of-thought, system prompts | Excalidraw: prompt anatomy, Mermaid: CoT reasoning flow | DONE |
| 18 | **Embeddings & Vector Search** — what are embeddings, similarity, vector databases | Excalidraw: embedding space visualization, D3: cosine similarity | DONE |
| 19 | **RAG: Retrieval-Augmented Generation** — chunking, indexing, retrieval, generation | Excalidraw: full RAG pipeline, Mermaid: retrieval flow | DONE |
| 20 | **Building a Chatbot** — system design, conversation memory, context window management | Mermaid: chatbot architecture, Excalidraw: conversation flow | DONE |

### Series 5: Agents & Reasoning (Week 7)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 21 | **AI Agents: Beyond Chat** — what are agents, agency levels, tool calling | Excalidraw: agent loop, Mermaid: agency levels | DONE |
| 22 | **Agent Patterns** — chaining, routing, parallelization, reflection | Mermaid: workflow patterns (one per pattern), Excalidraw: routing | DONE |
| 23 | **ReACT & Multi-Step Agents** — reasoning + acting, Reflexion, tree search | Excalidraw: ReACT loop, Mermaid: tree search | DONE |
| 24 | **Reasoning Models** — O-series, DeepSeek-R1, chain-of-thought, tree-of-thoughts | Excalidraw: reasoning approaches comparison, D3: accuracy vs compute chart | DONE |

### Series 6: Multimodal & Generative AI (Week 8)

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 25 | **How Image Generation Works** — VAE, GANs, diffusion models | Excalidraw: diffusion process step-by-step, D3: noise schedule | DONE |
| 26 | **Text-to-Image (Stable Diffusion)** — CLIP, U-Net, latent space, sampling | Excalidraw: full SD architecture, Mermaid: generation pipeline | DONE |
| 27 | **Text-to-Video & Beyond** — temporal modeling, DiT architecture | Mermaid: video generation pipeline, Excalidraw: frame interpolation | DONE |
| 28 | **The AI Landscape: What's Next** — scaling laws, emergent abilities, open problems | D3: timeline/trend charts, Excalidraw: AI landscape map | DONE |

### Series 7: Production AI Engineering (Week 9-10)

> Goal: Bridge the gap between understanding AI and building real AI products. A developer who finishes this series will know how to ship, evaluate, and maintain AI systems in production — the core skills of an AI engineer.

| # | Article | Key Visuals | Status |
|---|---------|-------------|--------|
| 29 | **Your First AI App with HuggingFace** — loading models, pipelines, tokenizers, inference; practice: run a local text classifier and summarizer | Excalidraw: HuggingFace ecosystem map, Mermaid: inference pipeline | DONE |
| 30 | **Fine-Tuning in Practice with PyTorch** — training loop, dataloaders, optimizer, saving checkpoints; practice: fine-tune a small model on custom data | Excalidraw: training loop anatomy, D3: loss curve live | DONE |
| 31 | **LangChain & LlamaIndex: Build with LLMs** — chains, tools, memory, document loaders, indexes; practice: build a Q&A bot over your own docs | Excalidraw: LangChain chain anatomy, Mermaid: LlamaIndex retrieval flow | DONE |
| 32 | **Serving AI Models: From Notebook to API** — FastAPI, model loading, batching, latency vs throughput; practice: wrap a model in a REST API | Mermaid: serving architecture, Excalidraw: request lifecycle | DONE |
| 33 | **Cloud AI: AWS, GCP & Azure for AI Engineers** — SageMaker, Vertex AI, Azure OpenAI, managed endpoints, when to use vs self-host | Excalidraw: cloud AI service map, Mermaid: deployment decision tree | DONE |
| 34 | **MLOps: Shipping AI Like Software** — experiment tracking (MLflow/W&B), model registry, CI/CD for models, versioning datasets | Mermaid: MLOps lifecycle, Excalidraw: pipeline stages | DONE |
| 35 | **Evaluating LLMs at Scale** — LLM-as-judge, evals frameworks (RAGAS, promptfoo), red-teaming, regression testing; practice: write an eval suite | Excalidraw: eval pipeline, D3: score comparison chart | DONE |
| 36 | **Cost, Latency & Context Management** — token budgets, caching (semantic cache), streaming, context window strategies, cost calculators; practice: optimize a RAG pipeline | Excalidraw: cost breakdown diagram, Mermaid: caching flow | DONE |

---

## Implementation Plan

### Phase 1: Setup (do first)
1. Install MDX dependencies (`next-mdx-remote`, `gray-matter`, `rehype-pretty-code`, `remark-gfm`)
2. Create `/articles` route with listing page
3. Create `[slug]` dynamic route with MDX rendering
4. Build `ArticleLayout` component (reuse patterns from `GuideLayout`)
5. Build reusable MDX components (Mermaid, Callout, Chart)
6. Create `articles.json` metadata structure
7. Add articles link to Header navigation
8. Style the articles section (consistent with existing design)

### Phase 2: Write Articles (series by series)
- Start with Series 1 (AI Fundamentals) articles 1-6
- Each article: write content → add excalidraw/mermaid diagrams → review
- Publish series by series, not all at once

### Phase 3: Enhancements (later)
- Reading progress bar
- Series navigation (prev/next within series)
- Table of contents sidebar
- Search within articles
- RSS feed for articles
- Related articles suggestions

---

## Visual Strategy

| Tool | Use For | Format |
|------|---------|--------|
| **Excalidraw** | Architecture diagrams, concept explanations, step-by-step flows | `.svg` exported, embedded in MDX |
| **Mermaid** | Flowcharts, sequence diagrams, class diagrams, pipeline flows | Inline in MDX, rendered client-side |
| **D3.js** | Data charts, interactive visualizations, animated graphs | Custom React components in MDX |
| **Code blocks** | Implementation examples, pseudocode | Syntax-highlighted via Shiki |

---

## Notes

- Articles are **learning-focused** (teach concepts simply) vs guides which are **reference-focused** (system design patterns)
- Target audience: developers who want to understand AI from the ground up
- Writing style: conversational, visual-first, build intuition before math
- Each article should be standalone but benefits from reading in order
- Inspired by ByteByteAI curriculum but written in our own style with richer visuals
