import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BabylonCare Cosmetics data...');

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = [
    { username: 'admin',      name: 'System Admin',  email: 'admin@babyloncare.com',       role: 'ADMIN',      department: 'IT',         status: 'ACTIVE' },
    { username: 'sara.sales', name: 'Sara Khan',      email: 'sara.khan@babyloncare.com',   role: 'SALES',      department: 'Sales',      status: 'ACTIVE' },
    { username: 'ali.prod',   name: 'Ali Hassan',     email: 'ali.hassan@babyloncare.com',  role: 'PRODUCTION', department: 'Production', status: 'ACTIVE' },
    { username: 'nadia.comp', name: 'Nadia Iqbal',    email: 'nadia.iqbal@babyloncare.com', role: 'COMPLIANCE', department: 'Compliance', status: 'ACTIVE' },
    { username: 'omar.rd',    name: 'Omar Farooq',    email: 'omar.farooq@babyloncare.com', role: 'RD',         department: 'R&D',        status: 'INACTIVE' },
  ];

  for (const u of users) {
    const hashed = bcrypt.hashSync('admin123', 10);
    await prisma.user.upsert({
      where: { username: u.username },
      update: { name: u.name, email: u.email, role: u.role, department: u.department, status: u.status },
      create: { ...u, password: hashed },
    });
  }
  console.log('✅ Users seeded');

  // ── Data Sources ───────────────────────────────────────────────────────────
  const shopifyDs = await prisma.dataSource.upsert({
    where: { name: 'Shopify Store' },
    update: { active: true, status: 'OK' },
    create: {
      name: 'Shopify Store',
      apiKey: 'shopify-connector-key-babyloncare',
      engineApiKey: 'engine-key-shopify-001',
      url: 'http://localhost:3001',
      active: true, status: 'OK', order: 1,
    },
  });

  const odooDs = await prisma.dataSource.upsert({
    where: { name: 'Odoo ERP' },
    update: { active: true, status: 'OK' },
    create: {
      name: 'Odoo ERP',
      apiKey: 'odoo-connector-key-babyloncare',
      engineApiKey: 'engine-key-odoo-002',
      url: 'http://localhost:3002',
      active: true, status: 'OK', order: 2,
    },
  });
  console.log('✅ Data sources seeded');

  // ── Entities (so PIS dropdown works immediately) ───────────────────────────
  const shopifyEntities = [
    { name: 'Product', status: 'ENABLED' as const, order: 1 },
    { name: 'Order',   status: 'ENABLED' as const, order: 2 },
  ];
  for (const ent of shopifyEntities) {
    await prisma.dataSourceEntity.upsert({
      where: { dataSourceId_name: { dataSourceId: shopifyDs.id, name: ent.name } },
      update: { status: ent.status },
      create: { dataSourceId: shopifyDs.id, ...ent },
    });
  }

  const odooEntities = [
    { name: 'Product',         status: 'ENABLED' as const, order: 1 },
    { name: 'Sales Order',     status: 'ENABLED' as const, order: 2 },
    { name: 'Inventory',       status: 'ENABLED' as const, order: 3 },
  ];
  for (const ent of odooEntities) {
    await prisma.dataSourceEntity.upsert({
      where: { dataSourceId_name: { dataSourceId: odooDs.id, name: ent.name } },
      update: { status: ent.status },
      create: { dataSourceId: odooDs.id, ...ent },
    });
  }
  console.log('✅ Entities seeded');

  // ── Compliance Records (idempotent: clear then re-seed) ────────────────────
  await prisma.complianceRecord.deleteMany();
  await prisma.complianceRecord.createMany({
    data: [
      { productSku: '1SHSBN',    productName: 'Burdock & Neem Shampoo',              regulation: 'EU Cosmetics Regulation 1223/2009', status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'All ingredients verified.' },
      { productSku: '1SPC2SF5',  productName: '2nd Skin Foundation Shade #5',         regulation: 'FDA 21 CFR Part 700',              status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Color additives approved.' },
      { productSku: '1BODSS2022',productName: 'Starter Sample Kit 2022',              regulation: 'Halal MS2200:2008',                status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'No animal-derived ingredients.' },
      { productSku: '1C2SCG',    productName: '2nd Skin Corrector',                   regulation: 'EU Cosmetics Regulation 1223/2009', status: 'UNDER_REVIEW',  auditedBy: 'Nadia Iqbal', notes: 'Pending re-evaluation of Titanium Dioxide.' },
      { productSku: '1FEMBE',    productName: 'Bright Eyes Masks',                    regulation: 'FDA 21 CFR Part 700',              status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Eye area formulation approved.' },
      { productSku: '1CPLPE',    productName: 'Fruit Pigmented Pomegranate Lipstick', regulation: 'EU Cosmetics Regulation 1223/2009', status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Natural pigments; no restricted substances.' },
      { productSku: 'GLHSGM',    productName: 'Glossy Locks Grow More Shampoo',       regulation: 'Halal MS2200:2008',                status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Halal ingredient list confirmed.' },
      { productSku: '1SHSBN',    productName: 'Burdock & Neem Shampoo',              regulation: 'ISO 22716 GMP',                    status: 'COMPLIANT',     auditedBy: 'Ali Hassan',  notes: 'Manufacturing facility GMP compliant.' },
      { productSku: '1C2SCG',    productName: '2nd Skin Corrector',                   regulation: 'ISO 22716 GMP',                    status: 'COMPLIANT',     auditedBy: 'Ali Hassan',  notes: 'Production process documented.' },
      { productSku: '1SPC2SF5',  productName: '2nd Skin Foundation Shade #5',         regulation: 'REACH Regulation (EC) 1907/2006', status: 'NON_COMPLIANT', auditedBy: 'Nadia Iqbal', notes: 'Trace restricted substance detected. Reformulation required.' },
      { productSku: '1BODSS2022',productName: 'Starter Sample Kit 2022',              regulation: 'FDA 21 CFR Part 700',              status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Approved for US market.' },
      { productSku: '1CPLPE',    productName: 'Fruit Pigmented Pomegranate Lipstick', regulation: 'Halal MS2200:2008',                status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'Pomegranate extract from Halal-certified supplier.' },
      { productSku: 'GLHSGM',    productName: 'Glossy Locks Grow More Shampoo',       regulation: 'EU Cosmetics Regulation 1223/2009', status: 'UNDER_REVIEW',  auditedBy: 'Nadia Iqbal', notes: 'New fragrance blend under assessment.' },
      { productSku: '1FEMBE',    productName: 'Bright Eyes Masks',                    regulation: 'ISO 22716 GMP',                    status: 'COMPLIANT',     auditedBy: 'Ali Hassan',  notes: 'Clean room production verified.' },
      { productSku: '1SHSBN',    productName: 'Burdock & Neem Shampoo',              regulation: 'REACH Regulation (EC) 1907/2006', status: 'COMPLIANT',     auditedBy: 'Nadia Iqbal', notes: 'No SVHC substances detected.' },
    ],
  });
  console.log('✅ Compliance records seeded');

  // ── Audit Logs (idempotent: clear then re-seed) ────────────────────────────
  await prisma.auditLog.deleteMany();
  const now = new Date();
  const ago = (d: number) => new Date(now.getTime() - d * 86400000);

  await prisma.auditLog.createMany({
    data: [
      { action: 'SYNC',   entity: 'Product',    entityId: 'shopify-1', description: 'Pulled 943 products from Shopify Store',           performedBy: 'system',     createdAt: ago(0) },
      { action: 'SYNC',   entity: 'Order',      entityId: 'shopify-1', description: 'Pulled 5971 orders from Shopify Store',             performedBy: 'system',     createdAt: ago(0) },
      { action: 'UPDATE', entity: 'Product',    entityId: '1C2SCG',    description: 'Compliance status updated to UNDER_REVIEW',         performedBy: 'nadia.comp', createdAt: ago(1) },
      { action: 'SYNC',   entity: 'Product',    entityId: 'odoo-2',    description: 'Pulled 87 products from Odoo ERP',                  performedBy: 'system',     createdAt: ago(1) },
      { action: 'CREATE', entity: 'Compliance', entityId: '1SPC2SF5',  description: 'Non-compliance flag raised: REACH Regulation',      performedBy: 'nadia.comp', createdAt: ago(2) },
      { action: 'SYNC',   entity: 'Inventory',  entityId: 'shopify-1', description: 'Inventory refreshed for 943 SKUs',                  performedBy: 'system',     createdAt: ago(2) },
      { action: 'UPDATE', entity: 'Product',    entityId: 'GLHSGM',    description: 'Product lifecycle status changed to ACTIVE',        performedBy: 'ali.prod',   createdAt: ago(3) },
      { action: 'SYNC',   entity: 'Product',    entityId: 'shopify-1', description: 'Incremental sync — 12 products updated',            performedBy: 'system',     createdAt: ago(4) },
      { action: 'CREATE', entity: 'Compliance', entityId: '1BODSS2022',description: 'Halal certification renewed for Starter Sample Kit',performedBy: 'nadia.comp', createdAt: ago(5) },
      { action: 'SYNC',   entity: 'Order',      entityId: 'shopify-1', description: 'Pulled 143 new orders from Shopify Store',          performedBy: 'system',     createdAt: ago(6) },
    ],
  });
  console.log('✅ Audit logs seeded');

  console.log('🎉 BabylonCare seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
