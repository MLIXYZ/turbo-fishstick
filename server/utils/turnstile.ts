import axios from 'axios';

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    if (!token) {
      return false;
    }

    const response = await axios.post(TURNSTILE_VERIFY_URL, {
      secret: TURNSTILE_SECRET_KEY,
      response: token
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}
