/**
 * LIVEKIT TOKEN MINTING EDGE FUNCTION
 * Phase 3.3: Video Bridge - Token Generation
 * 
 * Environment variables required (set in Supabase Dashboard):
 * - LIVEKIT_API_KEY: Your LiveKit API key
 * - LIVEKIT_API_SECRET: Your LiveKit API secret
 * 
 * Request: POST { roomName: string, participantName: string }
 * Response: { token: string }
 */

import { AccessToken } from 'https://esm.sh/livekit-server-sdk@2.5.0';

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const { roomName, participantName } = await req.json();

    // Validate required fields
    if (!roomName || !participantName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: roomName and participantName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get LiveKit credentials from environment
    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('Missing LiveKit credentials in environment');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create access token
    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // Grant permissions
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // Generate and return token
    const jwt = await token.toJwt();

    return new Response(
      JSON.stringify({ token: jwt }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error minting token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate token', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
