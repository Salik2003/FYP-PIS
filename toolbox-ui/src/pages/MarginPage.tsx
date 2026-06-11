import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Chip, Divider, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import shopifyIcon from '../assets/shopify-icon.png';
import odooIcon from '../assets/odoo-icon.png';
import { shopifyService } from '../services/shopifyService';
import { odooService } from '../services/odooService';

const normalize = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, '').trim() ?? '';
const PAGE_SIZE = 25;

type Band = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LOW' | 'LOSS';

const BANDS: Record<Band, { label: string; color: string; bg: string; border: string }> = {
    EXCELLENT: { label: 'Excellent',   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    GOOD:      { label: 'Good',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    MODERATE:  { label: 'Moderate',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    LOW:       { label: 'Low Margin',  color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    LOSS:      { label: 'Loss Making', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
};

function getBand(pct: number): Band {
    if (pct >= 60) return 'EXCELLENT';
    if (pct >= 40) return 'GOOD';
    if (pct >= 20) return 'MODERATE';
    if (pct >= 0)  return 'LOW';
    return 'LOSS';
}

function MarginBadge({ pct }: { pct: number }) {
    const b = BANDS[getBand(pct)];
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.35, bgcolor: b.bg, border: `1px solid ${b.border}`, borderRadius: 1 }}>
            {pct >= 0
                ? <TrendingUpIcon sx={{ fontSize: 11, color: b.color }} />
                : <TrendingDownIcon sx={{ fontSize: 11, color: b.color }} />
            }
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: b.color }}>{pct.toFixed(1)}%</Typography>
        </Box>
    );
}

function MiniBar({ pct }: { pct: number }) {
    const clamped = Math.max(0, Math.min(100, pct));
    const b = BANDS[getBand(pct)];
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, height: 4, bgcolor: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ width: `${clamped}%`, height: '100%', bgcolor: b.color, borderRadius: 2, transition: 'width 0.4s' }} />
            </Box>
        </Box>
    );
}

function Paginator({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    const start = page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, total);
    const btnSx = (d: boolean) => ({
        px: 1.5, py: 0.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#fff',
        fontSize: 12, fontWeight: 600, color: d ? '#cbd5e1' : '#475569',
        cursor: d ? 'default' : 'pointer', '&:hover': { bgcolor: d ? '#fff' : '#f1f5f9' },
    });
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, borderTop: '1px solid #eef0f3', bgcolor: '#f8fafc' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', flex: 1 }}>
                Showing {start}–{end} of {total.toLocaleString()} SKUs
            </Typography>
            <Box component="button" disabled={page === 0} onClick={() => onPage(page - 1)} sx={btnSx(page === 0)}>← Prev</Box>
            <Typography sx={{ fontSize: 12, color: '#475569', minWidth: 70, textAlign: 'center', fontWeight: 500 }}>{page + 1} / {pages}</Typography>
            <Box component="button" disabled={page >= pages - 1} onClick={() => onPage(Math.min(page + 1, pages - 1))} sx={btnSx(page >= pages - 1)}>Next →</Box>
        </Box>
    );
}

export default function MarginPage() {
    const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
    const [odooProducts, setOdooProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | Band>('ALL');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);

    useEffect(() => {
        Promise.all([
            shopifyService.getProducts().catch(() => []),
            odooService.getProducts().catch(() => []),
        ]).then(([sp, op]) => {
            setShopifyProducts(Array.isArray(sp) ? sp : []);
            setOdooProducts(Array.isArray(op) ? op : []);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => { setPage(0); }, [filter, sortDir]);

    // Match products cross-system and compute margins
    const matchedSkus = useMemo(() => {
        if (!shopifyProducts.length || !odooProducts.length) return [];

        const shopifyBySku = new Map(
            shopifyProducts
                .filter(p => p.variants?.[0]?.sku?.trim())
                .map(p => [p.variants[0].sku.toUpperCase().trim(), p])
        );
        const shopifyByName = new Map(shopifyProducts.map(p => [normalize(p.title), p]));
        const matchedShopifyIds = new Set<any>();
        const results: any[] = [];

        for (const op of odooProducts) {
            const sku = op.default_code && typeof op.default_code === 'string'
                ? op.default_code.toUpperCase().trim() : null;
            let sp: any = null;
            let matchType = '';

            if (sku && shopifyBySku.has(sku)) {
                sp = shopifyBySku.get(sku); matchType = 'SKU';
            } else {
                const key = normalize(op.name);
                if (key.length > 3 && shopifyByName.has(key)) {
                    sp = shopifyByName.get(key); matchType = 'Name';
                }
            }

            if (sp && !matchedShopifyIds.has(sp.id)) {
                matchedShopifyIds.add(sp.id);
                const shopifyPrice = parseFloat(sp.variants?.[0]?.price || '0');
                const odooCost = typeof op.standard_price === 'number' ? op.standard_price : 0;
                const hasCostData = odooCost > 0 && shopifyPrice > 0;
                const grossProfit = hasCostData ? shopifyPrice - odooCost : null;
                const marginPct = hasCostData ? ((shopifyPrice - odooCost) / shopifyPrice) * 100 : null;
                results.push({
                    id: sp.id,
                    name: sp.title,
                    sku: (sku || sp.variants?.[0]?.sku || '—'),
                    shopifyPrice,
                    odooCost,
                    grossProfit,
                    marginPct,
                    band: marginPct !== null ? getBand(marginPct) : null,
                    hasCostData,
                    matchType,
                });
            }
        }
        return results;
    }, [shopifyProducts, odooProducts]);

    const withCost = useMemo(() => matchedSkus.filter(m => m.hasCostData), [matchedSkus]);

    const stats = useMemo(() => {
        if (!withCost.length) return { avg: 0, excellent: 0, atRisk: 0, totalGrossProfit: 0 };
        return {
            avg: withCost.reduce((s, m) => s + m.marginPct, 0) / withCost.length,
            excellent: withCost.filter(m => m.band === 'EXCELLENT').length,
            atRisk: withCost.filter(m => ['LOW', 'LOSS'].includes(m.band!)).length,
            totalGrossProfit: withCost.reduce((s, m) => s + (m.grossProfit ?? 0), 0),
        };
    }, [withCost]);

    const bandCounts = useMemo(() =>
        Object.fromEntries(
            (['EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'LOSS'] as Band[]).map(b => [b, withCost.filter(m => m.band === b).length])
        ), [withCost]);

    const filtered = useMemo(() => {
        let result = filter === 'ALL' ? withCost : withCost.filter(m => m.band === filter);
        return [...result].sort((a, b) =>
            sortDir === 'asc' ? a.marginPct - b.marginPct : b.marginPct - a.marginPct
        );
    }, [withCost, filter, sortDir]);

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Box><Skeleton variant="text" width={220} height={24} /><Skeleton variant="text" width={340} height={18} /></Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={96} sx={{ borderRadius: 2 }} />)}
                </Box>
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1.5, mb: 2 }} />
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: '8px 8px 0 0' }} />
                {Array.from({ length: 12 }).map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, px: 2.5, py: 1.2, opacity: 1 - i * 0.06 }}>
                        {[3, 1, 0.8, 0.8, 0.8, 1, 0.6].map((w, j) => (
                            <Skeleton key={j} variant="rectangular" sx={{ flex: w, borderRadius: 1 }} height={32} />
                        ))}
                    </Box>
                ))}
            </Box>
        );
    }

    const HEADER = { fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em' };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <TrendingUpIcon sx={{ color: '#059669', mt: 0.3, fontSize: 22 }} />
                <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.4 }}>SKU Margin Analysis</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <img src={shopifyIcon} style={{ width: 13, height: 13 }} />
                            <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>Shopify selling price</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 12, color: '#cbd5e1', mx: 0.3 }}>vs</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <img src={odooIcon} style={{ width: 13, height: 13 }} />
                            <Typography sx={{ fontSize: 12.5, color: '#64748b' }}>Odoo cost of goods — cross-system gross margin per SKU</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                {[
                    {
                        label: 'SKUs Analyzed',
                        value: withCost.length.toLocaleString(),
                        sub: `of ${matchedSkus.length} cross-system matches`,
                        color: '#2563eb', Icon: TrendingUpIcon,
                    },
                    {
                        label: 'Avg Gross Margin',
                        value: `${stats.avg.toFixed(1)}%`,
                        sub: stats.avg >= 50 ? 'Strong margin profile' : stats.avg >= 30 ? 'Moderate — room to improve' : 'Below target — review pricing',
                        color: stats.avg >= 50 ? '#059669' : stats.avg >= 30 ? '#d97706' : '#dc2626', Icon: TrendingUpIcon,
                    },
                    {
                        label: 'Excellent Margin',
                        value: stats.excellent.toLocaleString(),
                        sub: `${withCost.length ? ((stats.excellent / withCost.length) * 100).toFixed(0) : 0}% of SKUs above 60%`,
                        color: '#059669', Icon: TrendingUpIcon,
                    },
                    {
                        label: 'Needs Attention',
                        value: stats.atRisk.toLocaleString(),
                        sub: 'Low margin or loss-making SKUs',
                        color: stats.atRisk > 0 ? '#dc2626' : '#059669', Icon: TrendingDownIcon,
                    },
                ].map((s, i) => (
                    <Box key={i} sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `3px solid ${s.color}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ width: 28, height: 28, bgcolor: `${s.color}18`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.Icon sx={{ fontSize: 15, color: s.color }} />
                            </Box>
                            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: '#94a3b8', mt: 0.5 }}>{s.sub}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Margin distribution bar */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2.5, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
                    Margin Distribution
                </Typography>
                <Box sx={{ display: 'flex', height: 28, borderRadius: 1.5, overflow: 'hidden', gap: 0.25 }}>
                    {(['EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'LOSS'] as Band[]).map(b => {
                        const count = bandCounts[b] || 0;
                        const pct = withCost.length ? (count / withCost.length) * 100 : 0;
                        if (pct < 0.5) return null;
                        return (
                            <Box
                                key={b}
                                onClick={() => setFilter(filter === b ? 'ALL' : b)}
                                sx={{ flex: pct, bgcolor: BANDS[b].color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: filter !== 'ALL' && filter !== b ? 0.3 : 1, transition: 'opacity 0.2s', '&:hover': { opacity: 0.85 } }}
                            >
                                {pct > 8 && <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{pct.toFixed(0)}%</Typography>}
                            </Box>
                        );
                    })}
                </Box>
                <Box sx={{ display: 'flex', gap: 2.5, mt: 1.2, flexWrap: 'wrap' }}>
                    {(['EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'LOSS'] as Band[]).map(b => (
                        <Box key={b} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: BANDS[b].color }} />
                            <Typography sx={{ fontSize: 11.5, color: '#64748b' }}>{BANDS[b].label}</Typography>
                            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#1e293b' }}>{bandCounts[b] || 0}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* No cost data warning */}
            {matchedSkus.length - withCost.length > 0 && (
                <Box sx={{ mb: 2, px: 2, py: 1.2, bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <InfoOutlinedIcon sx={{ fontSize: 15, color: '#d97706', mt: 0.15, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12.5, color: '#92400e' }}>
                        <strong>{matchedSkus.length - withCost.length}</strong> matched products have no cost data in Odoo and are excluded.
                        To include them, set the <strong>Cost</strong> field on each product in Odoo: Inventory → Products → Cost column.
                    </Typography>
                </Box>
            )}

            {/* Table */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                {/* Toolbar */}
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #eef0f3', bgcolor: '#f8fafc', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    {(['ALL', 'EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'LOSS'] as const).map(f => {
                        const active = filter === f;
                        const b = f === 'ALL' ? null : BANDS[f];
                        const count = f === 'ALL' ? withCost.length : (bandCounts[f] || 0);
                        return (
                            <Chip
                                key={f}
                                label={`${f === 'ALL' ? 'All' : b!.label} (${count})`}
                                size="small"
                                onClick={() => setFilter(f)}
                                sx={{
                                    fontSize: 11.5, fontWeight: active ? 700 : 500, height: 24, cursor: 'pointer',
                                    bgcolor: active ? (b?.bg ?? '#0f2d5218') : '#fff',
                                    color: active ? (b?.color ?? '#0f2d52') : '#64748b',
                                    border: `1px solid ${active ? (b?.border ?? '#0f2d52') : '#e2e8f0'}`,
                                    '&:hover': { bgcolor: b?.bg ?? '#f1f5f9' },
                                }}
                            />
                        );
                    })}
                    <Box sx={{ flex: 1 }} />
                    <Box
                        component="button"
                        onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#fff', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
                    >
                        <SwapVertIcon sx={{ fontSize: 14 }} />
                        {sortDir === 'asc' ? 'Worst first' : 'Best first'}
                    </Box>
                </Box>

                {/* Column headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2.5fr 1.1fr 1fr 1fr 1fr 1.4fr 1.5fr 70px', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                    {['Product', 'SKU', 'Sell Price', 'Cost (Odoo)', 'Gross Profit', 'Margin %', 'Margin Bar', 'Match'].map(h => (
                        <Typography key={h} sx={HEADER}>{h}</Typography>
                    ))}
                </Box>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                        <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>No SKUs match the selected filter.</Typography>
                    </Box>
                ) : paginated.map((m, i) => (
                    <Box key={m.id || i}>
                        <Box sx={{
                            display: 'grid', gridTemplateColumns: '2.5fr 1.1fr 1fr 1fr 1fr 1.4fr 1.5fr 70px',
                            px: 2.5, py: 1.4, alignItems: 'center',
                            '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.1s',
                        }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }} noWrap>{m.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: '#64748b', fontFamily: 'monospace' }}>{m.sku}</Typography>

                            {/* Shopify price */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <img src={shopifyIcon} style={{ width: 10, height: 10, opacity: 0.7 }} />
                                <Typography sx={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>${m.shopifyPrice.toFixed(2)}</Typography>
                            </Box>

                            {/* Odoo cost */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <img src={odooIcon} style={{ width: 10, height: 10, opacity: 0.7 }} />
                                <Typography sx={{ fontSize: 13, color: '#475569' }}>${m.odooCost.toFixed(2)}</Typography>
                            </Box>

                            {/* Gross profit */}
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: (m.grossProfit ?? 0) >= 0 ? '#059669' : '#dc2626' }}>
                                {(m.grossProfit ?? 0) >= 0 ? '+' : ''}${(m.grossProfit ?? 0).toFixed(2)}
                            </Typography>

                            {/* Margin badge */}
                            <MarginBadge pct={m.marginPct!} />

                            {/* Visual bar */}
                            <MiniBar pct={m.marginPct!} />

                            {/* Match type */}
                            <Chip label={m.matchType} size="small" sx={{ fontSize: 10, fontWeight: 600, bgcolor: '#eff6ff', color: '#2563eb', border: 'none', height: 18 }} />
                        </Box>
                        {i < paginated.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                    </Box>
                ))}

                <Paginator total={filtered.length} page={page} onPage={setPage} />
            </Box>
        </Box>
    );
}
