import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const USERNAME = 'admin';
const PASSWORD = 'admin123';

async function seed() {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, { username: USERNAME, password: PASSWORD });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        console.log('2. Fetching Data Sources...');
        const dsRes = await axios.get(`${API_URL}/data_sources`, { headers });
        const shopify = dsRes.data.find(d => d.name === 'Shopify Store');

        if (!shopify) {
            console.error('Shopify Store not found. Please run the previous setup steps.');
            return;
        }
        console.log(`Found Data Source: ${shopify.name} (ID: ${shopify.id})`);

        console.log('3. Pushing Entities (Schema)...');
        const entitiesPayload = {
            dataSourceId: shopify.id,
            entities: [
                {
                    name: 'Product',
                    order: 1,
                    fields: [
                        { name: 'id', type: 'number', primary: true, order: 1 },
                        { name: 'title', type: 'string', order: 2 },
                        { name: 'sku', type: 'string', order: 3 },
                        { name: 'price', type: 'number', order: 4 },
                        { name: 'status', type: 'string', order: 5 },
                        { name: 'inventory_quantity', type: 'number', order: 6 }
                    ]
                },
                {
                    name: 'Order',
                    order: 2,
                    fields: [
                        { name: 'id', type: 'number', primary: true, order: 1 },
                        { name: 'order_number', type: 'string', order: 2 },
                        { name: 'customer', type: 'string', order: 3 },
                        { name: 'total_price', type: 'number', order: 4 },
                        { name: 'status', type: 'string', order: 5 }
                    ]
                }
            ]
        };

        await axios.post(`${API_URL}/data_source_entities/push`, entitiesPayload, { headers });
        console.log('Entities created/updated.');

        console.log('4. Fetching Entity IDs...');
        const entsRes = await axios.get(`${API_URL}/data_source_entities?dataSourceId=${shopify.id}`, { headers });
        const productEntity = entsRes.data.find(e => e.name === 'Product');
        const orderEntity = entsRes.data.find(e => e.name === 'Order');

        if (productEntity) {
            console.log(`Pushing Data for Product (ID: ${productEntity.id})...`);
            const products = [
                { id: 101, title: 'Premium Leather Bag', sku: 'BAG-001', price: 129.99, status: 'active', inventory_quantity: 45 },
                { id: 102, title: 'Wireless Headphones', sku: 'AUDIO-WF', price: 199.50, status: 'active', inventory_quantity: 12 },
                { id: 103, title: 'Ergonomic Desk Chair', sku: 'FUR-099', price: 350.00, status: 'active', inventory_quantity: 8 },
                { id: 104, title: 'Mechanical Keyboard', sku: 'TECH-Key', price: 89.99, status: 'draft', inventory_quantity: 0 },
                { id: 105, title: 'USB-C Hub', sku: 'ACC-USB', price: 45.00, status: 'active', inventory_quantity: 150 },
                { id: 106, title: 'Monitor Stand', sku: 'ACC-MON', price: 29.99, status: 'archived', inventory_quantity: 0 },
                { id: 107, title: 'Smart Watch', sku: 'WEAR-001', price: 249.99, status: 'active', inventory_quantity: 33 },
                { id: 108, title: 'Running Shoes', sku: 'SHOE-RUN', price: 85.00, status: 'active', inventory_quantity: 67 }
            ];
            await axios.post(`${API_URL}/data_source_data/push/${productEntity.id}`, products, { headers });
        }

        if (orderEntity) {
            console.log(`Pushing Data for Order (ID: ${orderEntity.id})...`);
            const orders = [
                { id: 1001, order_number: '#1001', customer: 'John Doe', total_price: 129.99, status: 'paid' },
                { id: 1002, order_number: '#1002', customer: 'Jane Smith', total_price: 45.00, status: 'pending' },
                { id: 1003, order_number: '#1003', customer: 'Bob Johnson', total_price: 199.50, status: 'shipped' },
                { id: 1004, order_number: '#1004', customer: 'Alice Brown', total_price: 350.00, status: 'paid' },
                { id: 1005, order_number: '#1005', customer: 'Charlie Davis', total_price: 85.00, status: 'refunded' }
            ];
            await axios.post(`${API_URL}/data_source_data/push/${orderEntity.id}`, orders, { headers });
        }

        console.log('✅ Seeding Complete!');
    } catch (error) {
        console.error('Seeding failed:', error.response?.data || error.message);
    }
}

seed();
