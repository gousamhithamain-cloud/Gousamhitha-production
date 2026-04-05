const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.error('Error: .env file not found!');
        console.log('Please copy .env.example to .env and fill in your credentials.');
        process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            env[key.trim()] = value;
        }
    });
    
    return env;
}

function generateConfig() {
    const env = loadEnv();
    
    const configContent = `// Backend API Configuration
const APP_CONFIG = {
    API_URL: '${env.API_BASE_URL || 'http://localhost:5000'}/api',
    adminEmail: '${env.ADMIN_EMAIL || ''}',
    appName: '${env.APP_NAME || 'Gousamhitha'}',
    appDescription: '${env.APP_DESCRIPTION || 'Organic Products E-commerce Platform'}'
};

const RAZORPAY_CONFIG = {
    keyId: '${env.RAZORPAY_KEY_ID || ''}'
};

// Deprecated - kept for backward compatibility
const SUPABASE_CONFIG = { url: '', anonKey: '' };
`;
    
    const configPath = path.join(__dirname, 'config.js');
    fs.writeFileSync(configPath, configContent, 'utf8');
    
    console.log('✓ config.js generated successfully from .env');
    console.log('✓ API URL:', env.API_URL || 'http://localhost:5000/api');
    console.log('✓ Admin Email:', env.ADMIN_EMAIL || 'MISSING');
    console.log('✓ Razorpay Key:', env.RAZORPAY_KEY_ID ? '***configured***' : 'MISSING');
}

try {
    generateConfig();
} catch (error) {
    console.error('Error generating config:', error.message);
    process.exit(1);
}
