
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dataSources = await prisma.dataSource.findMany();
    console.log('Data Sources:', JSON.stringify(dataSources, null, 2));

    if (dataSources.length === 0) {
        console.log('No data sources found. Re-creating Shopify connector...');
        const ds = await prisma.dataSource.create({
            data: {
                name: 'Shopify Store',
                url: 'https://shopify.com/api',
                apiKey: 'shopify_key',
                engineApiKey: 'engine_key',
                active: true,
                status: 'OK',
                entities: {
                    create: [
                        { name: 'Product', status: 'ENABLED' },
                        { name: 'Order', status: 'ENABLED' }
                    ]
                }
            }
        });
        console.log('Created Shopify DataSource:', ds);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
