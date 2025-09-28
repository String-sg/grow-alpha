// Test script to verify environment configuration
// Note: This script only works in Node.js environment, not in Expo/React Native

console.log('Testing environment configuration...');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***SET***' : 'NOT SET');
console.log('EXPO_USERNAME:', process.env.EXPO_USERNAME);
console.log('EXPO_PUBLIC_GEMINI_API_KEY:', process.env.EXPO_PUBLIC_GEMINI_API_KEY ? '***SET***' : 'NOT SET');

// Test the auth config
const { GOOGLE_OAUTH_CONFIG } = require('../config/auth.js');

console.log('\nOAuth Configuration:');
console.log('CLIENT_ID:', GOOGLE_OAUTH_CONFIG.CLIENT_ID);
console.log('CLIENT_SECRET:', GOOGLE_OAUTH_CONFIG.CLIENT_SECRET ? '***SET***' : 'NOT SET');
console.log('REDIRECT_URI:', GOOGLE_OAUTH_CONFIG.REDIRECT_URI);

console.log('\nConfiguration status:');
if (GOOGLE_OAUTH_CONFIG.CLIENT_ID && GOOGLE_OAUTH_CONFIG.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
  console.log('✅ CLIENT_ID is configured');
} else {
  console.log('❌ CLIENT_ID needs to be configured');
}

if (GOOGLE_OAUTH_CONFIG.CLIENT_SECRET && GOOGLE_OAUTH_CONFIG.CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET') {
  console.log('✅ CLIENT_SECRET is configured');
} else {
  console.log('❌ CLIENT_SECRET needs to be configured');
}

if (GOOGLE_OAUTH_CONFIG.REDIRECT_URI && !GOOGLE_OAUTH_CONFIG.REDIRECT_URI.includes('your-expo-username')) {
  console.log('✅ REDIRECT_URI is configured');
} else {
  console.log('❌ REDIRECT_URI needs to be configured');
}

// Test Gemini API
async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API connection...');

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.log('❌ Gemini API key is not configured');
    return;
  }

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');

    console.log('API Key configured:', apiKey ? '✓ Present' : '✗ Missing');
    console.log('API Key starts with:', apiKey?.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent('Hello, respond with just "API working"');
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini API Response:', text);
    console.log('✅ Gemini API is working correctly');

  } catch (error) {
    console.error('❌ Gemini API Error:', {
      message: error.message,
      name: error.name,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack?.substring(0, 200) + '...'
    });
  }
}

// Run Gemini test
testGeminiAPI();