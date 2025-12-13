#!/usr/bin/env node

/**
 * Test Azure OpenAI deployment availability
 * Lists available models/deployments to help troubleshoot
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const endpoint = (process.env.AZURE_HOA_AI_ENDPOINT || '').replace(/\/+$/, '');
const apiKey = process.env.AZURE_HOA_AI_API_KEY;
const deployment = process.env.AZURE_HOA_AI_DEPLOYMENT_NAME;

console.log('🔍 Testing Azure OpenAI Configuration\n');
console.log('Endpoint:', endpoint);
console.log('Deployment:', deployment);
console.log('Has API Key:', !!apiKey);
console.log('');

if (!endpoint || !apiKey) {
  console.error('❌ Missing endpoint or API key');
  process.exit(1);
}

// Test the specified deployment
console.log(`Testing deployment: ${deployment}\n`);
const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;

const testBody = {
  messages: [{ role: 'user', content: 'Say OK' }],
  max_completion_tokens: 10,
};

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(testBody),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Deployment is working!');
    console.log('Response:', data.choices[0].message.content);
  } else {
    const errorText = await response.text();
    console.log('❌ Deployment test failed');
    console.log('Status:', response.status);
    console.log('Error:', errorText);
    console.log('\n💡 Possible issues:');
    console.log('   - Deployment name is incorrect or case-sensitive');
    console.log('   - Deployment is still being created');
    console.log('   - Deployment is in a different Azure OpenAI resource');
    console.log('\n📋 To fix:');
    console.log('   1. Go to Azure Portal');
    console.log('   2. Navigate to your Azure OpenAI resource');
    console.log('   3. Click "Deployments" in the left menu');
    console.log('   4. Note the EXACT deployment name (case-sensitive)');
    console.log('   5. Update AZURE_HOA_AI_DEPLOYMENT_NAME in .env.local');
  }
} catch (error) {
  console.error('❌ Connection error:', error.message);
}
