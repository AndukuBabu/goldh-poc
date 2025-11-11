import axios from 'axios';

// INSTRUCTIONS:
// 1. Replace the values below with your actual Zoho credentials
// 2. Run: npx tsx test-zoho-token.ts
// 3. Copy the refresh_token from the output

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';        // From Step 3
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE'; // From Step 3
const CODE = 'YOUR_CODE_HERE';                   // From Step 4 (expires in 3 minutes!)

async function generateRefreshToken() {
  try {
    console.log('🔄 Generating refresh token...\n');
    
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
