/**
 * Invite Token Utilities
 */

/**
 * Generate a random invite token
 * 12-character alphanumeric string
 */
export function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Build the invite URL
 */
export function buildInviteUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/join?token=${token}`;
}

/**
 * Validate invite token format
 */
export function isValidTokenFormat(token: string): boolean {
  return /^[A-Za-z0-9]{12}$/.test(token);
}
