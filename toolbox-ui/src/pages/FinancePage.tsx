import { useState, useEffect } from 'react';
import { Box, Typography, Divider, Tab, Tabs, Skeleton } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { odooService } from '../services/odooService';
import odooIcon from '../assets/odoo-icon.png';

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

const INVOICE_STATE: Record<string, { label: string; color: string; bg: string }> = {
    draft:  { label: 'Draft',      color: '#64748b', bg: '#f1f5f9' },
    posted: { label: 'Posted',     color: '#2563eb', bg: '#eff6ff' },
    cancel: { label: 'Cancelled',  color: '#dc2626', bg: '#fef2f2' },
};
const PAYMENT_STATE: Record<string, { label: string; color: string; bg: string }> = {
    not_paid:   { label: 'Unpaid',      color: '#dc2626', bg: '#fef2f2' },
    in_payment: { label: 'In Payment',  color: '#d97706', bg: '#fffbeb' },
    paid:       { label: 'Paid',        color: '#059669', bg: '#ecfdf5' },
    partial:    { label: 'Partial',     color: '#d97706', bg: '#fffbeb' },
};
const PO_STATE: Record<string, { label: string; color: string; bg: string }> = {
    draft:    { label: 'RFQ',        color: '#64748b', bg: '#f1f5f9' },
    sent:     { label: 'RFQ Sent',   color: '#2563eb', bg: '#eff6ff' },
    purchase: { label: 'Confirmed',  color: '#059669', bg: '#ecfdf5' },
    done:     { label: 'Done',       color: '#475569', bg: '#f8fafc' },
    cancel:   { label: 'Cancelled',  color: '#dc2626', bg: '#fef2f2' },
};

function StateBadge({ map, value }: { map: Record<string, { label: string; color: string; bg: string }>; value: string }) {
    const s = map[value] ?? { label: value ?? '—', color: '#64748b', bg: '#f1f5f9' };
    return (
        <Box sx={{ px: 1, py: 0.3, bgcolor: s.bg, borderRadius: 1, display: 'inline-block' }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</Typography>
        </Box>
    );
}

const resolve = (v: any): string => {
    const raw = Array.isArray(v) ? v[1] : (typeof v === 'string' ? v : '—');
    if (typeof raw !== 'string') return '—';
    // Odoo sometimes returns "Name, Name" (display_name with company duplicated) — dedupe
    const parts = raw.split(',').map(s => s.trim());
    return parts[0] === parts[1] ? parts[0] : raw;
};
const fmtDate = (d: any) => (d && typeof d === 'string') ? d.split(' ')[0] : '—';
const fmtAmt = (v: any) => typeof v === 'number' ? `$${v.toFixed(2)}` : '—';

const HEADER = { fontSize: 10.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.06em' };

export default function FinancePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tab, setTab] = useState(0);
    const [invoicesPage, setInvoicesPage] = useState(0);
    const [posPage, setPosPage] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => setError('Request timed out — Odoo connector may be unreachable. Restart the connector service and refresh.'), 120000);
        Promise.all([
            odooService.getInvoices().catch(() => []),
            odooService.getPurchaseOrders().catch(() => []),
        ]).then(([inv, pos]) => {
            clearTimeout(timeout);
            setInvoices(Array.isArray(inv) ? inv : []);
            setPurchaseOrders(Array.isArray(pos) ? pos : []);
        }).catch(() => {
            clearTimeout(timeout);
            setError('Failed to connect to Odoo connector. Check that the service on port 3002 is running.');
        }).finally(() => setLoading(false));
        return () => clearTimeout(timeout);
    }, []);

    const pgInvoices = invoices.slice(invoicesPage * PAGE_SIZE, (invoicesPage + 1) * PAGE_SIZE);
    const pgPos = purchaseOrders.slice(posPage * PAGE_SIZE, (posPage + 1) * PAGE_SIZE);

    // Summary stats from invoices
    const totalRevenue = invoices.reduce((s, inv) => s + (typeof inv.amount_total === 'number' ? inv.amount_total : 0), 0);
    const totalOutstanding = invoices.reduce((s, inv) => s + (typeof inv.amount_residual === 'number' ? inv.amount_residual : 0), 0);
    const totalPoValue = purchaseOrders.reduce((s, po) => s + (typeof po.amount_total === 'number' ? po.amount_total : 0), 0);

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
                <AccountBalanceIcon sx={{ fontSize: 40, color: '#e2e8f0' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>Finance data unavailable</Typography>
                <Typography sx={{ fontSize: 13, color: '#94a3b8', maxWidth: 440, textAlign: 'center' }}>{error}</Typography>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Skeleton variant="circular" width={22} height={22} />
                    <Box>
                        <Skeleton variant="text" width={160} height={24} />
                        <Typography sx={{ fontSize: 12, color: '#94a3b8', mt: 0.3 }}>Fetching all records from Odoo — first load may take 5–15s, then cached for 30 min</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rectangular" height={90} sx={{ borderRadius: 2 }} />)}
                </Box>
                <Skeleton variant="rectangular" height={48} sx={{ borderRadius: '8px 8px 0 0' }} />
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height={52} sx={{ mt: 0.5, opacity: 1 - i * 0.08 }} />
                ))}
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <AccountBalanceIcon sx={{ color: '#2563eb', mt: 0.3, fontSize: 22 }} />
                <Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1e293b', mb: 0.3 }}>Finance</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <img src={odooIcon} style={{ width: 14, height: 14 }} />
                        <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                            Invoices &amp; Purchase Orders from Purity Cosmetics Odoo ERP
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* KPI cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3 }}>
                {[
                    { label: 'Total Invoices', value: invoices.length.toLocaleString(), color: '#2563eb', sub: null, Icon: ReceiptLongIcon },
                    { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: '#059669', sub: `${invoices.filter(i => i.payment_state === 'paid').length} paid`, Icon: TrendingUpIcon },
                    { label: 'Outstanding', value: `$${(totalOutstanding / 1000).toFixed(1)}K`, color: totalOutstanding > 0 ? '#dc2626' : '#059669', sub: `${invoices.filter(i => i.payment_state === 'not_paid').length} unpaid`, Icon: ReceiptLongIcon },
                    { label: 'Purchase Orders', value: purchaseOrders.length.toLocaleString(), color: '#7c3aed', sub: `$${(totalPoValue / 1000).toFixed(1)}K total value`, Icon: ShoppingCartIcon },
                ].map((s, i) => (
                    <Box key={i} sx={{ bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, p: 2.5, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: `3px solid ${s.color}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ width: 30, height: 30, bgcolor: `${s.color}18`, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.Icon sx={{ fontSize: 16, color: s.color }} />
                            </Box>
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</Typography>
                        {s.sub && <Typography sx={{ fontSize: 11.5, color: '#94a3b8', mt: 0.5 }}>{s.sub}</Typography>}
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
                        <Tab label={`Invoices (${invoices.length})`} />
                        <Tab label={`Purchase Orders (${purchaseOrders.length})`} />
                    </Tabs>
                </Box>

                {/* ── Invoices ── */}
                {tab === 0 && (
                    <Box>
                        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptLongIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                            <Typography sx={{ fontSize: 12.5, color: '#1e40af' }}>
                                All customer invoices from Purity Cosmetics Odoo ERP — {invoices.length.toLocaleString()} records
                            </Typography>
                        </Box>
                        {invoices.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                <ReceiptLongIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                                <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>No invoices found</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr 1fr', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                                    {['Invoice #', 'Customer', 'Date', 'Due Date', 'Amount', 'Status'].map(h => (
                                        <Typography key={h} sx={HEADER}>{h}</Typography>
                                    ))}
                                </Box>
                                {pgInvoices.map((inv, i) => (
                                    <Box key={inv.id || i}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr 1fr', px: 2.5, py: 1.4, alignItems: 'center', '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{inv.name}</Typography>
                                            <Typography sx={{ fontSize: 12.5, color: '#475569' }} noWrap>{resolve(inv.partner_id)}</Typography>
                                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{fmtDate(inv.invoice_date)}</Typography>
                                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{fmtDate(inv.invoice_date_due)}</Typography>
                                            <Box>
                                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fmtAmt(inv.amount_total)}</Typography>
                                                {inv.amount_residual > 0 && inv.amount_residual !== inv.amount_total && (
                                                    <Typography sx={{ fontSize: 11, color: '#dc2626' }}>Due: {fmtAmt(inv.amount_residual)}</Typography>
                                                )}
                                            </Box>
                                            <StateBadge map={PAYMENT_STATE} value={inv.payment_state} />
                                        </Box>
                                        {i < pgInvoices.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                                    </Box>
                                ))}
                                <Paginator total={invoices.length} page={invoicesPage} onPage={setInvoicesPage} />
                            </>
                        )}
                    </Box>
                )}

                {/* ── Purchase Orders ── */}
                {tab === 1 && (
                    <Box>
                        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f5f3ff', borderBottom: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShoppingCartIcon sx={{ fontSize: 14, color: '#7c3aed' }} />
                            <Typography sx={{ fontSize: 12.5, color: '#5b21b6' }}>
                                All purchase orders from Purity Cosmetics Odoo ERP — {purchaseOrders.length.toLocaleString()} records
                            </Typography>
                        </Box>
                        {purchaseOrders.length === 0 ? (
                            <Box sx={{ py: 8, textAlign: 'center' }}>
                                <ShoppingCartIcon sx={{ fontSize: 36, color: '#e2e8f0', mb: 1 }} />
                                <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>No purchase orders found</Typography>
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr 1fr', px: 2.5, py: 1.2, bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' }}>
                                    {['PO Number', 'Vendor', 'Order Date', 'Expected', 'Total', 'Status'].map(h => (
                                        <Typography key={h} sx={HEADER}>{h}</Typography>
                                    ))}
                                </Box>
                                {pgPos.map((po, i) => (
                                    <Box key={po.id || i}>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 1.2fr 1fr', px: 2.5, py: 1.4, alignItems: 'center', '&:hover': { bgcolor: '#f8fafc' } }}>
                                            <Box>
                                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{po.name}</Typography>
                                                {po.partner_ref && typeof po.partner_ref === 'string' && (
                                                    <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>Ref: {po.partner_ref}</Typography>
                                                )}
                                            </Box>
                                            <Typography sx={{ fontSize: 12.5, color: '#475569' }} noWrap>{resolve(po.partner_id)}</Typography>
                                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{fmtDate(po.date_order)}</Typography>
                                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{fmtDate(po.date_planned)}</Typography>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fmtAmt(po.amount_total)}</Typography>
                                            <StateBadge map={PO_STATE} value={po.state} />
                                        </Box>
                                        {i < pgPos.length - 1 && <Divider sx={{ borderColor: '#f1f5f9' }} />}
                                    </Box>
                                ))}
                                <Paginator total={purchaseOrders.length} page={posPage} onPage={setPosPage} />
                            </>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
