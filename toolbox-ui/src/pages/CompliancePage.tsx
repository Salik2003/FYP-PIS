import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Select, MenuItem, FormControl,
    InputLabel, Divider, Chip, Skeleton,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ShieldIcon from '@mui/icons-material/Shield';
import { shopifyService } from '../services/shopifyService';

// ── Compliance rules based on real cosmetics product requirements ──────────
const RULES = [
    {
        id: 'sku',
        label: 'SKU Identification',
        description: 'Product must have a unique SKU for traceability and recall management',
        severity: 'critical' as const,
        check: (p: any) => !!(p.variants?.[0]?.sku?.trim()),
    },
    {
        id: 'active',
        label: 'Active Listing',
        description: 'Product must be actively listed — archived or draft products are not shelf-ready',
        severity: 'critical' as const,
        check: (p: any) => p.status === 'active',
    },
    {
        id: 'description',
        label: 'Product Information',
        description: 'Must include full product description for ingredient disclosure requirements',
        severity: 'important' as const,
        check: (p: any) => !!(p.body_html?.replace(/<[^>]+>/g, '').trim()),
    },
    {
        id: 'tags',
        label: 'Product Categorization',
        description: 'Must be tagged for proper category classification and searchability',
        severity: 'important' as const,
        check: (p: any) => !!(p.tags?.trim()),
    },
    {
        id: 'type',
        label: 'Product Type',
        description: 'Must have a defined product type for regulatory category mapping',
        severity: 'important' as const,
        check: (p: any) => !!(p.product_type?.trim()),
    },
];

function deriveStatus(product: any): { status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNDER_REVIEW'; failed: typeof RULES } {
    const failed = RULES.filter(r => !r.check(product));
    if (failed.some(r => r.severity === 'critical')) return { status: 'NON_COMPLIANT', failed };
    if (failed.length > 0) return { status: 'UNDER_REVIEW', failed };
    return { status: 'COMPLIANT', failed: [] };
}

const STATUS_STYLE = {
    COMPLIANT:     { label: 'Compliant',     color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', Icon: CheckCircleOutlineIcon },
    UNDER_REVIEW:  { label: 'Under Review',  color: '#d97706', bg: '#fffbeb', border: '#fcd34d', Icon: HourglassEmptyIcon },
    NON_COMPLIANT: { label: 'Non-Compliant', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', Icon: ErrorOutlineIcon },
};

const PAGE_SIZE = 25;

function Paginator({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
    const pages = Math.ceil(total / PAGE_SIZE);
    if (pages <= 1) return null;
    const start = page * PAGE_SIZE + 1;
    const end = Math.min((page + 1) * PAGE_SIZE, total);
    const btnSx = (disabled: boolean) => ({
        px: 1.5, py: 0.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#fff',
        fontSize: 12, fontWeight: 600, color: disabled ? '#cbd5e1' : '#475569',
        cursor: disabled ? 'default' : 'pointer', transition: 'background 0.1s',
        '&:hover': { bgcolor: disabled ? '#fff' : '#f1f5f9' },
    });
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 1.5, borderTop: '1px solid #eef0f3', bgcolor: '#f8fafc' }}>
            <Typography sx={{ fontSize: 12, color: '#64748b', flex: 1 }}>
                Showing {start}–{end} of {total.toLocaleString()} products
            </Typography>
            <Box component="button" disabled={page === 0} onClick={() => onPage(page - 1)} sx={btnSx(page === 0)}>← Prev</Box>
            <Typography sx={{ fontSize: 12, color: '#475569', minWidth: 70, textAlign: 'center', fontWeight: 500 }}>
                {page + 1} / {pages}
            </Typography>
            <Box component="button" disabled={page >= pages - 1} onClick={() => onPage(Math.min(page + 1, pages - 1))} sx={btnSx(page >= pages - 1)}>Next →</Box>
        </Box>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = STATUS_STYLE[status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.UNDER_REVIEW;
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.4, bgcolor: s.bg, border: `1px solid ${s.border}`, borderRadius: 1 }}>
            <s.Icon sx={{ fontSize: 13, color: s.color }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: s.color }}>{s.label}</Typography>
        </Box>
    );
}

export default function CompliancePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [ruleFilter, setRuleFilter] = useState('ALL');
    const [page, setPage] = useState(0);

    useEffect(() => {
        shopifyService.getProducts()
            .then(data => setProducts(Array.isArray(data) ? data : []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, []);

    // Derive compliance for every real product
    const complianceData = useMemo(() =>
        products.map(p => ({ product: p, ...deriveStatus(p) })),
        [products]
    );

    const stats = useMemo(() => ({
        compliant:    complianceData.filter(d => d.status === 'COMPLIANT').length,
        underReview:  complianceData.filter(d => d.status === 'UNDER_REVIEW').length,
        nonCompliant: complianceData.filter(d => d.status === 'NON_COMPLIANT').length,
    }), [complianceData]);

    const filtered = useMemo(() => {
        let result = complianceData;
        if (filter !== 'ALL') result = result.filter(d => d.status === filter);
        if (ruleFilter !== 'ALL') result = result.filter(d => d.failed.some(r => r.id === ruleFilter));
        return result;
    }, [complianceData, filter, ruleFilter]);

    // Reset to page 0 when filters change
    useEffect(() => { setPage(0); }, [filter, ruleFilter]);

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width={200} height={24} />
                        <Skeleton variant="text" width={320} height={18} />
                    </Box>
                </Box>
                <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 2, mb: 3 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                    {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />)}
                </Box>
                <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={50} />
                    <Skeleton variant="rectangular" height={46} sx={{ mt: 0.5 }} />
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, px: 2.5, py: 1, opacity: 1 - i * 0.07 }}>
                            <Skeleton variant="text" sx={{ flex: 2 }} height={20} />
                            <Skeleton variant="text" sx={{ flex: 1 }} height={20} />
                            <Skeleton variant="rectangular" width={90} height={22} sx={{ borderRadius: 1 }} />
                            <Skeleton variant="text" sx={{ flex: 2 }} height={20} />
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    const HEADER = { fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em' };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <ShieldIcon sx={{ color: '#2563eb', mt: 0.3, fontSize: 22 }} />
                <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.3 }}>Compliance Monitor</Typography>
                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                        {products.length.toLocaleString()} products evaluated against {RULES.length} compliance rules
                    </Typography>
                </Box>
            </Box>

            {/* Rule reference */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {RULES.map(r => (
                    <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: r.severity === 'critical' ? '#dc2626' : '#d97706', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{r.label}</Typography>
                        <Chip label={r.severity} size="small" sx={{ fontSize: 10, height: 16, bgcolor: r.severity === 'critical' ? '#fef2f2' : '#fffbeb', color: r.severity === 'critical' ? '#dc2626' : '#d97706', fontWeight: 700 }} />
                    </Box>
                ))}
            </Box>

            {/* Stat cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                {([
                    { key: 'COMPLIANT',     label: 'Compliant',     value: stats.compliant,    pct: ((stats.compliant / products.length) * 100).toFixed(1) },
                    { key: 'UNDER_REVIEW',  label: 'Under Review',  value: stats.underReview,  pct: ((stats.underReview / products.length) * 100).toFixed(1) },
                    { key: 'NON_COMPLIANT', label: 'Non-Compliant', value: stats.nonCompliant, pct: ((stats.nonCompliant / products.length) * 100).toFixed(1) },
                ] as const).map(s => {
                    const style = STATUS_STYLE[s.key];
                    return (
                        <Box key={s.key} sx={{
                            bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2.5,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderLeft: `3px solid ${style.color}`,
                            cursor: 'pointer', transition: 'box-shadow 0.2s',
                            outline: filter === s.key ? `2px solid ${style.color}` : 'none',
                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                        }} onClick={() => setFilter(filter === s.key ? 'ALL' : s.key)}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, bgcolor: style.bg, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <style.Icon sx={{ fontSize: 20, color: style.color }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value.toLocaleString()}</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: 0.3 }}>{s.label} · {s.pct}%</Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Table */}
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Toolbar */}
                <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #eef0f3', bgcolor: '#f8fafc', flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#374151', flex: 1 }}>
                        Products
                        <Box component="span" sx={{ ml: 1, px: 1, py: 0.3, bgcolor: '#e2e8f0', borderRadius: 1, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                            {filtered.length}
                        </Box>
                    </Typography>
                    {filter !== 'ALL' && (
                        <Box
                            component="button"
                            onClick={() => setFilter('ALL')}
                            sx={{ fontSize: 11.5, color: '#2563eb', border: 'none', bgcolor: 'transparent', cursor: 'pointer', fontWeight: 600, px: 0 }}
                        >
                            Clear filter
                        </Box>
                    )}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel sx={{ fontSize: 13 }}>Status</InputLabel>
                        <Select label="Status" value={filter} onChange={e => setFilter(e.target.value)} sx={{ fontSize: 13, borderRadius: 1.5 }}>
                            <MenuItem value="ALL" sx={{ fontSize: 13 }}>All Statuses</MenuItem>
                            <MenuItem value="COMPLIANT" sx={{ fontSize: 13 }}>Compliant</MenuItem>
                            <MenuItem value="UNDER_REVIEW" sx={{ fontSize: 13 }}>Under Review</MenuItem>
                            <MenuItem value="NON_COMPLIANT" sx={{ fontSize: 13 }}>Non-Compliant</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel sx={{ fontSize: 13 }}>Failed Rule</InputLabel>
                        <Select label="Failed Rule" value={ruleFilter} onChange={e => setRuleFilter(e.target.value)} sx={{ fontSize: 13, borderRadius: 1.5 }}>
                            <MenuItem value="ALL" sx={{ fontSize: 13 }}>All Rules</MenuItem>
                            {RULES.map(r => <MenuItem key={r.id} value={r.id} sx={{ fontSize: 13 }}>{r.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>

                {/* Column headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                    {['Product', 'SKU', 'Status', 'Failed Rules'].map(h => (
                        <Typography key={h} sx={HEADER}>{h}</Typography>
                    ))}
                </Box>

                {/* Rows */}
                {paginated.map(({ product: p, status, failed }, i) => (
                    <Box key={p.id || i}>
                        <Box sx={{
                            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr',
                            px: 2.5, py: 1.4, alignItems: 'center',
                            '&:hover': { bgcolor: '#f8fafc' }, transition: 'background 0.12s',
                        }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }} noWrap>{p.title}</Typography>
                            <Typography sx={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                                {p.variants?.[0]?.sku || <Box component="span" sx={{ color: '#fca5a5' }}>Missing</Box>}
                            </Typography>
                            <Box><StatusBadge status={status} /></Box>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {failed.length === 0
                                    ? <Typography sx={{ fontSize: 12, color: '#059669' }}>All rules passed</Typography>
                                    : failed.map(r => (
                                        <Chip
                                            key={r.id}
                                            label={r.label}
                                            size="small"
                                            sx={{
                                                fontSize: 10.5, fontWeight: 600, height: 20,
                                                bgcolor: r.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                                                color: r.severity === 'critical' ? '#dc2626' : '#d97706',
                                            }}
                                        />
                                    ))
                                }
                            </Box>
                        </Box>
                        {i < paginated.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                    </Box>
                ))}

                {filtered.length === 0 && (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <ShieldIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                        <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>No products match the selected filters.</Typography>
                    </Box>
                )}

                <Paginator total={filtered.length} page={page} onPage={setPage} />
            </Box>
        </Box>
    );
}
