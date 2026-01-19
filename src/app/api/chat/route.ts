import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { DC_REAL_ESTATE_SYSTEM_PROMPT } from '@/lib/ai/prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build context-aware system prompt
    let systemPrompt = DC_REAL_ESTATE_SYSTEM_PROMPT;

    if (context) {
      systemPrompt += `\n\n## Current User Context\n`;
      if (context.userRole) {
        systemPrompt += `- User is a: ${context.userRole.toUpperCase()}\n`;
      }
      if (context.propertyAddress) {
        systemPrompt += `- Property: ${context.propertyAddress}\n`;
      }
      if (context.salePrice) {
        systemPrompt += `- Sale Price: $${context.salePrice.toLocaleString()}\n`;
      }
      if (context.isTenanted) {
        systemPrompt += `- Property has tenants: YES (TOPA applies!)\n`;
      }
      if (context.currentPage) {
        systemPrompt += `- User is currently viewing: ${context.currentPage}\n`;
      }
    }

    // Format conversation history for Gemini
    const chatHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `System Instructions: ${systemPrompt}` }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I\'m ready to help with DC FSBO real estate questions.' }],
        },
        ...chatHistory,
      ],
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response.text();

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
