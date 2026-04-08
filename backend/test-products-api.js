require('dotenv').config({ path: __dirname + '/.env' });
const supabase = require('./config/supabase');

async function testProductsAPI() {
    console.log('🔍 Testing Products API...\n');
    
    // Test 1: Get products from database
    console.log('1. Fetching products from Supabase:');
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, category, price, stock, in_stock, image_url')
        .limit(5);
    
    if (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
    
    console.log(`✅ Found ${products.length} products\n`);
    
    if (products.length > 0) {
        console.log('📦 First Product:');
        console.log(JSON.stringify(products[0], null, 2));
        console.log('\n🔑 Available Fields:', Object.keys(products[0]));
    } else {
        console.log('⚠️ No products found in database!');
    }
    
    // Test 2: Test the API endpoint
    console.log('\n\n2. Testing API Endpoint:');
    try {
        const response = await fetch('http://localhost:4000/api/products?limit=5');
        const apiData = await response.json();
        
        console.log('📡 API Response Status:', response.status);
        console.log('📥 API Response Structure:');
        console.log(JSON.stringify(apiData, null, 2));
        
        if (apiData.data && apiData.data.items) {
            console.log(`\n✅ API returned ${apiData.data.items.length} products`);
            if (apiData.data.items.length > 0) {
                console.log('\n📦 First Product from API:');
                console.log(JSON.stringify(apiData.data.items[0], null, 2));
            }
        }
    } catch (err) {
        console.error('❌ API Error:', err.message);
        console.log('⚠️ Make sure backend server is running on port 4000');
    }
    
    process.exit(0);
}

testProductsAPI();
