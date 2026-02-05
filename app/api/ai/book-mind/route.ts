import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { getUserSubscriptionTier } from '@/lib/db/users'

export const runtime = "nodejs"; // Changed from edge to support database queries

// Book Mind AI API endpoint
// Supports OpenAI, Anthropic, Grok/xAI, or other providers via environment variables
// GATED: Pro subscription required

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface BookMindRequest {
  messages: Message[];
  context?: {
    selectedText?: string;
    chapterContent?: string;
    action?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: BookMindRequest = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // ===== SUBSCRIPTION CHECK: Book Mind AI is Pro-only =====
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use Book Mind AI.' },
        { status: 401 }
      )
    }

    // Check subscription tier
    const tier = await getUserSubscriptionTier(user.id)

    if (tier !== 'pro') {
      console.log(`Book Mind AI access denied for free user: ${user.id}`)
      return NextResponse.json(
        {
          error: 'Book Mind AI is a Pro feature. Upgrade to access AI-powered book analysis.',
          requiresUpgrade: true,
          feature: 'book_mind_ai'
        },
        { status: 403 }
      )
    }

    console.log(`Book Mind AI access granted for Pro user: ${user.id}`)
    // ===== END SUBSCRIPTION CHECK =====

    // Check for API key - support multiple providers
    const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // Grok/xAI (uses OpenAI-compatible API)
    if (grokKey) {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokKey}`,
        },
        body: JSON.stringify({
          model: process.env.XAI_MODEL || 'grok-3-mini',
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Grok API error:', error);
        return NextResponse.json(
          { error: error.error?.message || 'Grok API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({
        content,
        model: data.model,
        usage: data.usage,
      });
    }

    if (openaiKey) {
      // Use OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', error);
        return NextResponse.json(
          { error: error.error?.message || 'OpenAI API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return NextResponse.json({
        content,
        model: data.model,
        usage: data.usage,
      });
    }

    if (anthropicKey) {
      // Use Anthropic Claude
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
          max_tokens: 2000,
          system: systemMessage,
          messages: userMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('Anthropic API error:', error);
        return NextResponse.json(
          { error: error.error?.message || 'Anthropic API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      return NextResponse.json({
        content,
        model: data.model,
        usage: data.usage,
      });
    }

    // No API key configured - return helpful message
    return NextResponse.json(
      { 
        error: "Book Mind AI is not configured. Please add an API key to your environment variables.",
        setup: {
          grok: "Add XAI_API_KEY to .env.local",
          openai: "Add OPENAI_API_KEY to .env.local",
          anthropic: "Add ANTHROPIC_API_KEY to .env.local"
        }
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('Book Mind API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
