/**
 * VIDEO UTILITIES
 * Phase 3.3: Video Bridge - Token Fetching
 * 
 * Provides utility functions for LiveKit video integration.
 */

import { supabase } from './supabase';

interface TokenResponse {
  token: string;
}

/**
 * Fetches a LiveKit access token from the Edge Function
 * @param room - The room name to join
 * @param username - The participant's display name/identity
 * @returns Promise resolving to the JWT token string
 * @throws Error if the request fails
 */
export async function getToken(room: string, username: string): Promise<string> {
  if (!room || !username) {
    throw new Error('Room and username are required');
  }

  try {
    const { data, error } = await supabase.functions.invoke<TokenResponse>('mint-token', {
      body: {
        roomName: room,
        participantName: username,
      },
    });

    if (error) {
      throw new Error(`Failed to fetch token: ${error.message}`);
    }

    if (!data?.token) {
      throw new Error('Invalid response: token not found');
    }

    return data.token;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    throw new Error(`Token fetch failed: ${errorMessage}`);
  }
}
