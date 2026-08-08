import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const requests = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 5; // max 5 requests per minute per IP

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests.get(ip).filter(t => now - t < windowMs);
  timestamps.push(now);
  requests.set(ip, timestamps);

  return timestamps.length > maxRequests;
}

export async function POST(request) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error:b   'Too many requests — please wait a minute before trying again' },
      { status: 429 }
    );
  }

  // Read and validate the body
  const body = await request.json();
  const { idea } = body;

  // Input validation
  if (!idea || typeof idea !== 'string') {
    return NextResponse.json(
      { error: 'Please provide an idea' },
      { status: 400 }
    );
  }

  const trimmed = idea.trim();

  if (trimmed.length === 0) {
    return NextResponse.json(
      { error: 'Idea cannot be empty' },
      { status: 400 }
    );
  }

  if (trimmed.length > 500) {
    return NextResponse.json(
      { error: 'Idea is too long — keep it under 500 characters' },
      { status: 400 }
    );
  }

  // Call n8n webhook with the secret header
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret, // secret travels here
      },
      body: JSON.stringify({ idea: trimmed }),
    });

    if (!response.ok) {
      console.error('n8n webhook error:', response.status);
      return NextResponse.json(
        { error: 'Content generation failed — please try again' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Fetch error:', err.message);
    return NextResponse.json(
      { error: 'Network error — please try again' },
      { status: 500 }
    );
  }
}