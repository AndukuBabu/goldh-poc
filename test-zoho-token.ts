import axios from 'axios';

// INSTRUCTIONS:
// 1. App Credentials from Zoho API Console
const CLIENT_ID = process.env.ZOHO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || '';

// 2. The Authorization Code from Step 4 (expires in 3 minutes!)
const CODE = process.env.ZOHO_AUTH_CODE || '';

// 3. The Refresh Token from Step 5 (if you already have one and want to test it)
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '';

async function generateRefreshToken() {
  try {
    console.log('🔄 Generating refresh token...\n');

    if (!CLIENT_ID || !CLIENT_SECRET || !CODE) {
      console.error('❌ ERROR: CLIENT_ID, CLIENT_SECRET, or CODE environment variables are not set.');
      console.log('Please ensure ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_AUTH_CODE are set in your environment.');
      return;
    }

    const response = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      null,
      {
        params: {
          code: CODE,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'authorization_code',
        },
      }
    );

    console.log('✅ SUCCESS! Here are your credentials:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REFRESH_TOKEN:', response.data.refresh_token);
    console.log('API_DOMAIN:', response.data.api_domain);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Copy these values for Step 6!\n');

  } catch (error: any) {
    console.error('❌ ERROR:', error.response?.data || error.message);
    console.log('\nCommon issues:');
    console.log('- Code expired (regenerate in Step 4)');
    console.log('- Wrong Client ID or Secret');
    console.log('- Code already used (generate new one)');
  }
}

generateRefreshToken();
