// Test if OpenAI key works
const OPENAI_API_KEY = 'sk-proj-abc123'; // Replace with actual key from secrets

async function testOpenAI() {
  console.log('🧪 Testing OpenAI API key...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: 'Say "API working"' }
      ],
    }),
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text);
}

testOpenAI();
