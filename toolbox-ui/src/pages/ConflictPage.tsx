import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Chip, Divider, Tab, Tabs, Skeleton } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import shopifyIcon from '../assets/shopify-icon.png';
import odooIcon from '../assets/odoo-icon.png';
import { shopifyService } from '../services/shopifyService';
import { odooService } from '../services/odooService';

const normalize = (s: string) =>
    s?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() ?? '';

const PAGE_SIZE = 25;

function Paginator({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    const start = page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, total);
    const btnSx = (disabled: boolean) => ({
        px: 1.5, py: 0.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#fff',
        fontSize: 12, fontWeight: 600, color: disabled ? '#cbd5e1' : '#475569',
        cursor: disabled ? 'default' : 'pointer', '&:hover': { bgcolor: disabled ? '#fff' : '#f1f5f9' },
    });
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, borderTop: '1px solid #eef0f3', bgcolor: '#f8fafc' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', flex: 1 }}>
                Showing {start}–{end} of {total.toLocaleString()} records
            </Typography>
            <Box component="button" disabled={page === 0} onClick={() => onPage(page - 1)} sx={btnSx(page === 0)}>← Prev</Box>
            <Typography sx={{ fontSize: 12, color: '#475569', minWidth: 70, textAlign: 'center', fontWeight: 500 }}>
                {page + 1} / {pages}
            </Typography>
            <Box component="button" disabled={page >= pages - 1} onClick={() => onPage(Math.min(page + 1, pages - 1))} sx={btnSx(page >= pages - 1)}>Next →</Box>
        </Box>
    );
}

function DiffCell({ a, b, format = (v: any) => String(v ?? '—') }: { a: any; b: any; format?: (v: any) => string }) {
    const changed = Math.abs(Number(a) - Number(b)) > 0.01 || String(a) !== String(b);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <img src={shopifyIcon} style={{ width: 11, height: 11 }} />
                <Typography sx={{ fontSize: 12, color: changed ? '#dc2626' : '#475569', fontWeight: changed ? 700 : 400 }}>{format(a)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <img src={odooIcon} style={{ width: 11, height: 11 }} />
                <Typography sx={{ fontSize: 12, color: changed ? '#dc2626' : '#475569', fontWeight: changed ? 700 : 400 }}>{format(b)}</Typography>
            </Box>
        </Box>
    );
}

export default function ConflictPage() {
    const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
    const [odooProducts, setOdooProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [conflictsPage, setConflictsPage] = useState(0);
    const [missingOdooPage, setMissingOdooPage] = useState(0);
    const [missingShopifyPage, setMissingShopifyPage] = useState(0);

    useEffect(() => {
        Promise.all([
            shopifyService.getProducts().catch(() => []),
            odooService.getProducts().catch(() => []),
        ]).then(([sp, op]) => {
            setShopifyProducts(Array.isArray(sp) ? sp : []);
            setOdooProducts(Array.isArray(op) ? op : []);
        }).finally(() => setLoading(false));
    }, []);

    const { priceConflicts, missingInOdoo, missingInShopify } = useMemo(() => {
        if (!shopifyProducts.length && !odooProducts.length) return { priceConflicts: [], missingInOdoo: [], missingInShopify: [] };

        const shopifyBySku = new Map(
            shopifyProducts
                .filter(p => p.variants?.[0]?.sku?.trim())
                .map(p => [p.variants[0].sku.toUpperCase().trim(), p])
        );
        const shopifyByName = new Map(shopifyProducts.map(p => [normalize(p.title), p]));
        const odooBySku = new Map(
            odooProducts
                .filter(p => p.default_code && typeof p.default_code === 'string' && p.default_code.trim())
                .map(p => [String(p.default_code).toUpperCase().trim(), p])
        );
        const odooByName = new Map(odooProducts.map(p => [normalize(p.name), p]));

        const priceConflicts: any[] = [];
        const matchedShopifyIds = new Set<any>();
        const matchedOdooIds = new Set<any>();

        for (const op of odooProducts) {
            const sku = op.default_code && typeof op.default_code === 'string'
                ? op.default_code.toUpperCase().trim() : null;
            let sp: any = null;
            let matchType = '';

            if (sku && shopifyBySku.has(sku)) {
                sp = shopifyBySku.get(sku);
                matchType = 'SKU';
            } else {
                const key = normalize(op.name);
                if (key.length > 3 && shopifyByName.has(key)) {
                    sp = shopifyByName.get(key);
                    matchType = 'Name';
                }
            }

            if (sp) {
                matchedShopifyIds.add(sp.id);
                matchedOdooIds.add(op.id);
                const shopifyPrice = parseFloat(sp.variants?.[0]?.price || '0');
                const odooPrice = op.list_price || 0;
                const priceDiff = Math.abs(shopifyPrice - odooPrice);
                if (priceDiff > 0.01) {
                    priceConflicts.push({ shopify: sp, odoo: op, matchType, shopifyPrice, odooPrice, priceDiff });
                }
            }
        }

        const missingInOdoo = shopifyProducts.filter(p => !matchedShopifyIds.has(p.id));
        const missingInShopify = odooProducts.filter(p => !matchedOdooIds.has(p.id));

        return { priceConflicts, missingInOdoo, missingInShopify };
    }, [shopifyProducts, odooProducts]);

    const pgConflicts = priceConflicts.slice(conflictsPage * PAGE_SIZE, (conflictsPage + 1) * PAGE_SIZE);
    const pgMissingOdoo = missingInOdoo.slice(missingOdooPage * PAGE_SIZE, (missingOdooPage + 1) * PAGE_SIZE);
    const pgMissingShopify = missingInShopify.slice(missingShopifyPage * PAGE_SIZE, (missingShopifyPage + 1) * PAGE_SIZE);

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Box><Skeleton variant="text" width={180} height={24} /><Skeleton variant="text" width={280} height={18} /></Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={90} sx={{ borderRadius: 2 }} />)}
                </Box>
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '8px 8px 0 0' }} />
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Skeleton key={i} variant="rectangular" height={56} sx={{ mt: 0.5, opacity: 1 - i * 0.08 }} />
                ))}
            </Box>
        );
    }

    const HEADER = { fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em' };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CompareArrowsIcon sx={{ color: '#2563eb', mt: 0.3, fontSize: 22 }} />
                <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.3 }}>Conflict Detection</Typography>
                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                        Cross-system product comparison — Shopify vs Odoo
                    </Typography>
                </Box>
            </Box>

            {/* Stat cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                {[
                    { label: 'Shopify Products', value: shopifyProducts.length, color: '#96bf48', icon: shopifyIcon },
                    { label: 'Odoo Products',    value: odooProducts.length,   color: '#714B67', icon: odooIcon },
                    { label: 'Price Conflicts',  value: priceConflicts.length, color: priceConflicts.length > 0 ? '#dc2626' : '#059669', alert: priceConflicts.length > 0 },
                    { label: 'Missing in Odoo',  value: missingInOdoo.length,  color: '#d97706', alert: missingInOdoo.length > 0 },
                ].map((s, i) => (
                    <Box key={i} sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `3px solid ${s.color}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {s.icon
                                ? <img src={s.icon} style={{ width: 16, height: 16 }} />
                                : s.alert
                                    ? <WarningAmberIcon sx={{ fontSize: 16, color: s.color }} />
                                    : <CheckCircleOutlineIcon sx={{ fontSize: 16, color: s.color }} />
                            }
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value.toLocaleString()}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Tabs */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: '1px solid #eef0f3', px: 2 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
                        minHeight: 44,
                        '& .MuiTab-root': { fontSize: 13, fontWeight: 600, textTransform: 'none', minHeight: 44, color: '#94a3b8' },
                        '& .Mui-selected': { color: '#2563eb' },
                        '& .MuiTabs-indicator': { bgcolor: '#2563eb', height: 2 },
                    }}>
                        <Tab label={`Price Conflicts (${priceConflicts.length})`} />
                        <Tab label={`Missing in Odoo (${missingInOdoo.length})`} />
                        <Tab label={`Missing in Shopify (${missingInShopify.length})`} />
                    </Tabs>
                </Box>

                {/* ── Price Conflicts ── */}
                {tab === 0 && (
                    <Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.5fr 1fr 80px', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                            {['Product Name', 'Match By', 'Price Comparison', 'Difference', 'Gap %'].map(h => (
                                <Typography key={h} sx={HEADER}>{h}</Typography>
                            ))}
                        </Box>
                        {priceConflicts.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#a7f3d0', mb: 1 }} />
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>No price conflicts detected</Typography>
                                <Typography sx={{ fontSize: 12.5, color: '#94a3b8', mt: 0.5 }}>All matched products have consistent pricing across systems.</Typography>
                            </Box>
                        ) : pgConflicts.map((c, i) => (
                            <Box key={i}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.5fr 1fr 80px', px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: '#fef9f9' } }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }} noWrap>{c.shopify.title}</Typography>
                                        <Typography sx={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{c.shopify.variants?.[0]?.sku}</Typography>
                                    </Box>
                                    <Chip label={c.matchType} size="small" sx={{ fontSize: 11, fontWeight: 600, bgcolor: '#eff6ff', color: '#2563eb', border: 'none', height: 20 }} />
                                    <DiffCell a={c.shopifyPrice} b={c.odooPrice} format={v => `$${Number(v).toFixed(2)}`} />
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>${c.priceDiff.toFixed(2)}</Typography>
                                    <Box sx={{ px: 1, py: 0.3, bgcolor: '#fef2f2', borderRadius: 1, display: 'inline-block' }}>
                                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626' }}>
                                            {((c.priceDiff / Math.max(c.shopifyPrice, c.odooPrice)) * 100).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                </Box>
                                {i < pgConflicts.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                            </Box>
                        ))}
                        <Paginator total={priceConflicts.length} page={conflictsPage} onPage={setConflictsPage} />
                    </Box>
                )}

                {/* ── Missing in Odoo ── */}
                {tab === 1 && (
                    <Box>
                        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fffbeb', borderBottom: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: 15, color: '#d97706' }} />
                            <Typography sx={{ fontSize: 12.5, color: '#92400e' }}>
                                {missingInOdoo.length} Shopify products have no matching record in Odoo ERP.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 100px', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                            {['Product Name', 'SKU', 'Price', 'Status'].map(h => <Typography key={h} sx={HEADER}>{h}</Typography>)}
                        </Box>
                        {pgMissingOdoo.map((p, i) => (
                            <Box key={p.id || i}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 100px', px: 2.5, py: 1.4, alignItems: 'center', '&:hover': { bgcolor: '#f8fafc' } }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }} noWrap>{p.title}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{p.variants?.[0]?.sku || '—'}</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569' }}>${parseFloat(p.variants?.[0]?.price || '0').toFixed(2)}</Typography>
                                    <Box sx={{ px: 1, py: 0.3, bgcolor: p.status === 'active' ? '#ecfdf5' : '#f3f4f6', borderRadius: 1, display: 'inline-block' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: p.status === 'active' ? '#059669' : '#94a3b8', textTransform: 'capitalize' }}>{p.status}</Typography>
                                    </Box>
                                </Box>
                                {i < pgMissingOdoo.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                            </Box>
                        ))}
                        <Paginator total={missingInOdoo.length} page={missingOdooPage} onPage={setMissingOdooPage} />
                    </Box>
                )}

                {/* ── Missing in Shopify ── */}
                {tab === 2 && (
                    <Box>
                        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#fffbeb', borderBottom: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WarningAmberIcon sx={{ fontSize: 15, color: '#d97706' }} />
                            <Typography sx={{ fontSize: 12.5, color: '#92400e' }}>
                                {missingInShopify.length} Odoo products have no matching record in Shopify.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                            {['Product Name', 'SKU / Code', 'Odoo Price', 'Type'].map(h => <Typography key={h} sx={HEADER}>{h}</Typography>)}
                        </Box>
                        {pgMissingShopify.map((p, i) => (
                            <Box key={p.id || i}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1fr 1fr', px: 2.5, py: 1.4, alignItems: 'center', '&:hover': { bgcolor: '#f8fafc' } }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }} noWrap>{p.name}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{p.default_code || '—'}</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569' }}>${Number(p.list_price || 0).toFixed(2)}</Typography>
                                    <Box sx={{ px: 1, py: 0.3, bgcolor: '#eff6ff', borderRadius: 1, display: 'inline-block' }}>
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'capitalize' }}>
                                            {({ product: 'Storable', consu: 'Consumable', service: 'Service' } as any)[p.type] ?? p.type ?? '—'}
                                        </Typography>
                                    </Box>
                                </Box>
                                {i < pgMissingShopify.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                            </Box>
                        ))}
                        <Paginator total={missingInShopify.length} page={missingShopifyPage} onPage={setMissingShopifyPage} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
