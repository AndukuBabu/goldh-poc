// Verify that the COINGECKO_API_KEY secret is accessible
// Run with: npx tsx server/scripts/verifySecret.ts

console.log('🔍 Verifying CoinGecko API Key Secret...\n');

const apiKey = process.env.COINGECKO_API_KEY;

if (apiKey) {
  console.log('✅ Secret found: COINGECKO_API_KEY');
  console.log(`   Length: ${apiKey.length} characters`);
  console.log(`   First 10 chars: ${apiKey.substring(0, 10)}...`);
  console.log(`   Last 4 chars: ...${apiKey.slice(-4)}`);
  console.log('\n✅ Secret will be included in scheduler requests as header:');
  console.log('   x-cg-demo-api-key: <value>');
} else {
  console.warn('⚠️  Secret not found: COINGECKO_API_KEY');
  console.warn('   Scheduler will use keyless fallback (more restrictive rate limits)');
  console.warn('\n   To add secret:');
  console.warn('   1. Click "Secrets" tab (🔒) in left sidebar');
  console.warn('   2. Click "+ New Secret"');
  console.warn('   3. Key: COINGECKO_API_KEY');
  console.warn('   4. Value: Your CoinGecko demo API key');
}

console.log('\n✅ Verification complete');
