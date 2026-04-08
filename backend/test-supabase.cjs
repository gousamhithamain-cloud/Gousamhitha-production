// Test Supabase connection directly
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', url);
console.log('Key:', key ? 'Present' : 'Missing');

const supabase = createClient(url, key);

async function testQueries() {
    console.log('\n=== Testing Products Query ===');
    
    // Test 1: Select all
    const test1 = await supabase.from('products').select('*').limit(2);
    console.log('\nTest 1 - Select *:');
    console.log('Error:', test1.error);
    console.log('Data:', JSON.stringify(test1.data, null, 2));
    
    // Test 2: Select specific columns
    const test2 = await supabase.from('products').select('id, name, price, stock').limit(2);
    console.log('\nTest 2 - Select specific columns:');
    console.log('Error:', test2.error);
    console.log('Data:', JSON.stringify(test2.data, null, 2));
    
    // Test 3: Vendors
    const test3 = await supabase.from('vendors').select('*').limit(2);
    console.log('\n=== Testing Vendors Query ===');
    console.log('Error:', test3.error);
    console.log('Data:', JSON.stringify(test3.data, null, 2));
}

testQueries().then(() => {
    console.log('\n=== Tests Complete ===');
    process.exit(0);
}).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
