import { NextResponse } from 'next/server';

export async function POST(request) {
  // Read the idea from the incoming request body
  const body = await request.json();
  const { idea } = body;

  // Validate — don't send empty ideas to the AI
  if (!idea || idea.trim().length === 0) {
    return NextResponse.json(
      { error: 'Please provide an idea' },
      { status: 400 }
    );
  }

  if (idea.trim().length > 500) {
    return NextResponse.json(
      { error: 'Idea is too long — keep it under 500 characters' },
      { status: 400 }
    );
  }

  // Call your n8n webhook — the URL stays secret on the server
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idea: idea.trim() }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Something went wrong — please try again' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}