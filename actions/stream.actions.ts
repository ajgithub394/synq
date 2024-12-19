"use server"
import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const user = await currentUser();

  if (!user) {
    throw new Error('User is not logged in');
  }

  if (!apiKey) {
    throw new Error('API key does not exist');
  }

  if (!apiSecret) {
    throw new Error('No API Secret');
  }

  const client = new StreamClient(apiKey, apiSecret);

  // Generate token with user_id and optional expiration
  const token = client.generateUserToken({
    user_id: user.id,
    validity_in_seconds: 3600, // Token valid for 1 hour
  });

  return token;
};
