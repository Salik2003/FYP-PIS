
import axios from 'axios';

async function test() {
    try {
        // Login
        const loginRes = await axios.post('http://localhost:3000/api/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.access_token;
        console.log('Login successful');

        // Fetch data sources
        const dsRes = await axios.get('http://localhost:3000/api/data_sources', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Data Sources from API:', JSON.stringify(dsRes.data, null, 2));

        // Fetch stats
        const statsRes = await axios.get('http://localhost:3000/api/shopify-api/stats');
        console.log('Shopify Stats from API:', JSON.stringify(statsRes.data, null, 2));

        // Fetch products (this might take a few seconds)
        console.log('Fetching products (testing pagination)...');
        const productsRes = await axios.get('http://localhost:3000/api/shopify-api/products');
        console.log('Total Products from API:', productsRes.data.length);


    } catch (err) {
        console.error('Test failed:', err.response?.data || err.message);
    }
}

test();
