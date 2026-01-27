/**
 * Initialization script to create a demo university in the Convex database
 * Run this script with: node scripts/init-demo-university.js
 */

const { convex } = require('../convex/_generated/server');

async function initDemoUniversity() {
  console.log('Initializing demo university...');
  
  try {
    // This would typically be called from a Convex function
    // For now, we'll just log the instruction
    console.log('To initialize the demo university, call the ensureDemoUniversity mutation');
    console.log('This can be done from the Convex dashboard or by adding it to your app initialization');
    console.log('\nExample usage in your app:');
    console.log('const ensureDemoUniversity = useMutation(api.universities.ensureDemoUniversity);');
    console.log('await ensureDemoUniversity();');
  } catch (error) {
    console.error('Error initializing demo university:', error);
  }
}

initDemoUniversity();
