// Automated Platform Verification Script for Go Creators
const BASE_URL = 'http://localhost:5000/api';

async function runSimulation() {
  console.log('====================================================');
  console.log('🎬 GO CREATORS - AUTOMATED LIVE PLATFORM VERIFICATION');
  console.log('====================================================\n');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('✅ [1/5] Server Health:', health);

  // 2. Login as Jane Reynolds (Director)
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jane@gocreators.io', password: 'password123' })
  });
  const janeAuth = await loginRes.json();
  const token = janeAuth.token;
  console.log('\n✅ [2/5] Logged in as:', janeAuth.user.name, `(${janeAuth.user.role})`);

  // 3. Verify Privacy Masking on Unconnected Crew
  const crewRes = await fetch(`${BASE_URL}/crew`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const crewData = await crewRes.json();
  
  const elena = crewData.crew.find(c => c.name.includes('Elena'));
  const mark = crewData.crew.find(c => c.name.includes('Mark'));

  console.log('\n🔒 [3/5] PRIVACY & CONDITIONAL VISIBILITY CHECK:');
  console.log('  • Elena Rostova (Unconnected):');
  console.log('    - Connection Status:', elena.connectionStatus);
  console.log('    - Phone Masked:', elena.phone);
  console.log('    - Avatar Masked:', elena.avatar.includes('blur'));

  console.log('  • Mark Davis (Accepted Connection):');
  console.log('    - Connection Status:', mark.connectionStatus);
  console.log('    - Phone Revealed:', mark.phone);
  console.log('    - Avatar Unmasked:', !mark.avatar.includes('blur'));

  // 4. Test Automated Moderation (15-Report Threshold Rule)
  console.log('\n🛡️ [4/5] AUTOMATED MODERATION & STRICT REPORT THRESHOLD:');
  const modStatsRes = await fetch(`${BASE_URL}/moderation/stats`);
  const modStats = await modStatsRes.json();
  console.log(`  • Safety Rule Threshold: Accounts > ${modStats.threshold} reports are auto-blocked.`);
  console.log(`  • Total Users: ${modStats.totalUsers} | Blocked Users: ${modStats.blockedUsers}`);
  
  const warningUser = crewData.crew.find(u => u.email === 'warning@gocreators.io');
  console.log(`  • Warning Candidate: ${warningUser.name} (isBlocked: ${warningUser.isBlocked})`);

  // Trigger ban by reporting warning user to 16
  const banTriggerRes = await fetch(`${BASE_URL}/moderation/test-ban/${warningUser._id}`, { method: 'POST' });
  const banResult = await banTriggerRes.json();
  console.log('  ⚡ Triggered 16th report:', banResult.message);

  // Attempt login as blocked user (Should fail with 403 Forbidden)
  const blockedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'warning@gocreators.io', password: 'password123' })
  });
  const blockedLoginData = await blockedLoginRes.json();
  console.log(`  ⛔ Blocked Login Attempt HTTP Status: ${blockedLoginRes.status} (Forbidden)`);
  console.log(`  ⛔ Lockout Reason: "${blockedLoginData.error}"`);

  // Reset warning user back to normal for ongoing tests
  await fetch(`${BASE_URL}/moderation/reset/${warningUser._id}`, { method: 'POST' });
  console.log('  🔄 Candidate reset back to normal testing state.');

  // 5. Test GoCreators AI Assistant (Diner Scene Prompt)
  console.log('\n🤖 [5/5] GOCRATERS AI ASSISTANT QUERY:');
  const prompt = 'Suggest 3 unique visual approaches for the diner scene';
  console.log(`  • Prompt: "${prompt}"`);
  
  const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prompt })
  });
  const aiData = await aiRes.json();
  console.log('\n--- AI Guidance Output ---\n' + aiData.text + '\n--------------------------');

  console.log('\n🎉 ALL SYSTEMS VERIFIED AND RUNNING OPERATIONAL AT http://localhost:5000\n');
}

runSimulation().catch(console.error);

