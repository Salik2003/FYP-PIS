import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Button, Chip, Skeleton } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProductDetailDrawer from './ProductDetailDrawer';

interface EntityDataGridProps {
    data: any[];
    loading: boolean;
    entityName?: string;
    sourceType?: 'shopify' | 'odoo' | string;
}

const CELL = { fontSize: 13, color: '#334155', py: 0 };
const HEADER = { fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' };

export default function EntityDataGrid({ data, loading, entityName, sourceType }: EntityDataGridProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleView = useCallback((item: any) => { setSelectedItem(item); setDrawerOpen(true); }, []);

    const viewBtn = (params: any) => (
        <Button
            size="small" variant="outlined"
            startIcon={<VisibilityIcon sx={{ fontSize: '14px !important' }} />}
            onClick={e => { e.stopPropagation(); handleView(params.row); }}
            sx={{
                fontSize: 12, textTransform: 'none', borderRadius: 1.5,
                borderColor: '#e2e8f0', color: '#475569', py: 0.3, px: 1.2,
                boxShadow: 'none',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc', boxShadow: 'none' },
            }}
        >
            View
        </Button>
    );

    const columns = useMemo<GridColDef[]>(() => {
        if (!data?.length) return [];

        // ── Odoo Product layout ─────────────────────────────────────────
        if (sourceType === 'odoo' && entityName?.toLowerCase() === 'product') {
            return [
                { field: 'id', headerName: 'ID', width: 70, renderCell: p => <Box sx={{ fontSize: 12, color: '#94a3b8' }}>{p.value}</Box> },
                { field: 'name', headerName: 'NAME', flex: 2, minWidth: 200, renderCell: p => <Box sx={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{p.value}</Box> },
                { field: 'default_code', headerName: 'SKU', flex: 1, minWidth: 120, renderCell: p => <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{p.value || '—'}</Box> },
                {
                    field: 'list_price', headerName: 'PRICE', width: 110,
                    renderCell: p => <Box sx={{ fontWeight: 600, fontSize: 13 }}>${Number(p.value || 0).toFixed(2)}</Box>
                },
                {
                    field: 'type', headerName: 'TYPE', width: 130,
                    renderCell: p => {
                        const map: Record<string, string> = { product: 'Storable', consu: 'Consumable', service: 'Service' };
                        return <Box sx={{ px: 1, py: 0.3, bgcolor: '#eff6ff', borderRadius: 1, fontSize: 11.5, fontWeight: 600, color: '#2563eb' }}>{map[p.value] ?? p.value ?? '—'}</Box>;
                    }
                },
                { field: 'categ_id', headerName: 'CATEGORY', flex: 1, minWidth: 140, renderCell: p => <Box sx={CELL}>{Array.isArray(p.value) ? p.value[1] : p.value ?? '—'}</Box> },
                { field: 'actions', headerName: '', width: 90, sortable: false, renderCell: viewBtn },
            ];
        }

        // ── Odoo Inventory layout ───────────────────────────────────────
        if (sourceType === 'odoo' && entityName?.toLowerCase() === 'inventory') {
            return [
                { field: 'id', headerName: 'ID', width: 70, renderCell: p => <Box sx={{ fontSize: 12, color: '#94a3b8' }}>{p.value}</Box> },
                { field: 'product_id', headerName: 'PRODUCT', flex: 2, minWidth: 200, renderCell: p => <Box sx={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{Array.isArray(p.value) ? p.value[1] : p.value}</Box> },
                { field: 'location_id', headerName: 'LOCATION', flex: 1, minWidth: 150, renderCell: p => <Box sx={CELL}>{Array.isArray(p.value) ? p.value[1] : p.value}</Box> },
                {
                    field: 'quantity', headerName: 'ON HAND', width: 110,
                    renderCell: p => <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: Number(p.value) > 0 ? '#ecfdf5' : '#fef2f2', fontSize: 12, fontWeight: 700, color: Number(p.value) > 0 ? '#059669' : '#dc2626' }}>{Number(p.value || 0).toFixed(0)}</Box>
                },
                {
                    field: 'reserved_quantity', headerName: 'RESERVED', width: 110,
                    renderCell: p => <Box sx={{ fontSize: 12.5, color: '#64748b' }}>{Number(p.value || 0).toFixed(0)}</Box>
                },
            ];
        }

        // ── Odoo Sales Order layout ─────────────────────────────────────
        if (sourceType === 'odoo' && entityName?.toLowerCase() === 'sales order') {
            return [
                { field: 'name', headerName: 'ORDER', width: 130, renderCell: p => <Box sx={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{p.value}</Box> },
                { field: 'partner_id', headerName: 'CUSTOMER', flex: 1, minWidth: 180, renderCell: p => <Box sx={CELL}>{Array.isArray(p.value) ? p.value[1] : p.value}</Box> },
                {
                    field: 'amount_total', headerName: 'TOTAL', width: 120,
                    renderCell: p => {
                        const currency = Array.isArray(p.row.currency_id) ? p.row.currency_id[1] : '';
                        return <Box sx={{ fontWeight: 600, fontSize: 13 }}>{currency} {Number(p.value || 0).toFixed(2)}</Box>;
                    }
                },
                {
                    field: 'state', headerName: 'STATUS', width: 120,
                    renderCell: p => {
                        const map: Record<string, [string, string]> = { sale: ['#ecfdf5', '#059669'], done: ['#eff6ff', '#2563eb'], draft: ['#f3f4f6', '#64748b'], cancel: ['#fef2f2', '#dc2626'] };
                        const labels: Record<string, string> = { sale: 'Confirmed', done: 'Done', draft: 'Quotation', cancel: 'Cancelled' };
                        const [bg, color] = map[p.value] ?? ['#f3f4f6', '#64748b'];
                        return <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: bg, fontSize: 11.5, fontWeight: 700, color }}>{labels[p.value] ?? p.value}</Box>;
                    }
                },
                { field: 'date_order', headerName: 'DATE', width: 140, renderCell: p => <Box sx={{ fontSize: 12.5, color: '#64748b' }}>{p.value ? new Date(p.value).toLocaleDateString() : '—'}</Box> },
                { field: 'actions', headerName: '', width: 90, sortable: false, renderCell: viewBtn },
            ];
        }

        if (entityName?.toLowerCase() === 'product') {
            return [
                {
                    field: 'title', headerName: 'NAME', flex: 2, minWidth: 200,
                    renderCell: p => <Box sx={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{p.value}</Box>
                },
                {
                    field: 'sku', headerName: 'SKU', flex: 1, minWidth: 120,
                    valueGetter: (_v, row) => row.variants?.[0]?.sku || 'N/A',
                    renderCell: p => <Box sx={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{p.value}</Box>
                },
                {
                    field: 'quantity', headerName: 'STOCK', width: 90,
                    valueGetter: (_v, row) => row.variants?.reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0) ?? 0,
                    renderCell: p => (
                        <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: p.value > 0 ? '#ecfdf5' : '#fef2f2', fontSize: 12, fontWeight: 700, color: p.value > 0 ? '#059669' : '#dc2626' }}>
                            {p.value}
                        </Box>
                    )
                },
                { field: 'vendor', headerName: 'VENDOR', flex: 1, minWidth: 120, renderCell: p => <Box sx={CELL}>{p.value}</Box> },
                { field: 'product_type', headerName: 'TYPE', flex: 1, minWidth: 110, renderCell: p => <Box sx={CELL}>{p.value || '—'}</Box> },
                {
                    field: 'status', headerName: 'LIFECYCLE', width: 110,
                    renderCell: p => {
                        const s = p.value as string;
                        const color = s === 'active' ? '#059669' : s === 'draft' ? '#d97706' : '#94a3b8';
                        const bg = s === 'active' ? '#ecfdf5' : s === 'draft' ? '#fffbeb' : '#f3f4f6';
                        return (
                            <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: bg, fontSize: 11.5, fontWeight: 700, color, textTransform: 'capitalize' }}>
                                {s || 'Unknown'}
                            </Box>
                        );
                    }
                },
                { field: 'actions', headerName: '', width: 90, sortable: false, renderCell: viewBtn },
            ];
        }

        if (entityName?.toLowerCase() === 'order') {
            return [
                {
                    field: 'name', headerName: 'ORDER', width: 100,
                    renderCell: p => <Box sx={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{p.value}</Box>
                },
                {
                    field: 'customer', headerName: 'CUSTOMER', flex: 1, minWidth: 150,
                    valueGetter: (_v, row) => row.customer ? `${row.customer.first_name || ''} ${row.customer.last_name || ''}`.trim() || row.customer.email || 'Guest' : 'Guest',
                    renderCell: p => <Box sx={CELL}>{p.value}</Box>
                },
                {
                    field: 'total_price', headerName: 'TOTAL', width: 110,
                    renderCell: p => <Box sx={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{p.row.currency} {p.value}</Box>
                },
                {
                    field: 'financial_status', headerName: 'PAYMENT', width: 110,
                    renderCell: p => {
                        const s = p.value;
                        const map: Record<string, [string, string]> = { paid: ['#ecfdf5', '#059669'], pending: ['#fffbeb', '#d97706'], refunded: ['#fef2f2', '#dc2626'] };
                        const [bg, color] = map[s] ?? ['#f3f4f6', '#64748b'];
                        return <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: bg, fontSize: 11.5, fontWeight: 700, color, textTransform: 'capitalize' }}>{s}</Box>;
                    }
                },
                {
                    field: 'fulfillment_status', headerName: 'FULFILLMENT', width: 120,
                    renderCell: p => {
                        const s = p.value || 'unfulfilled';
                        const map: Record<string, [string, string]> = { fulfilled: ['#ecfdf5', '#059669'], partial: ['#fffbeb', '#d97706'], unfulfilled: ['#f3f4f6', '#64748b'] };
                        const [bg, color] = map[s] ?? ['#f3f4f6', '#64748b'];
                        return <Box sx={{ px: 1, py: 0.3, borderRadius: 1, bgcolor: bg, fontSize: 11.5, fontWeight: 700, color, textTransform: 'capitalize' }}>{s}</Box>;
                    }
                },
                {
                    field: 'created_at', headerName: 'DATE', width: 130,
                    valueGetter: (_v, row) => new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    renderCell: p => <Box sx={{ fontSize: 12.5, color: '#64748b' }}>{p.value}</Box>
                },
                { field: 'actions', headerName: '', width: 90, sortable: false, renderCell: viewBtn },
            ];
        }

        // Generic fallback
        const exclude = ['body_html', 'admin_graphql_api_id', 'images', 'image', 'variants', 'options', 'customer', 'line_items', 'billing_address', 'shipping_address', 'note_attributes', 'tags'];
        return Object.keys(data[0]).filter(k => !exclude.includes(k)).slice(0, 8).map(k => ({
            field: k,
            headerName: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            flex: 1, minWidth: 120,
            renderCell: (p: any) => {
                const v = p.value;
                return <Box sx={CELL}>{typeof v === 'object' && v !== null ? JSON.stringify(v).slice(0, 30) + '…' : String(v ?? '—')}</Box>;
            }
        }));
    }, [data, entityName]);

    return (
        <Box sx={{ height: '100%', bgcolor: '#fff', border: '1px solid #eef0f3', borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #eef0f3', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#374151' }}>
                    {entityName ? `${entityName} Records` : 'Entity Records'}
                </Typography>
                {data.length > 0 && (
                    <Box sx={{ px: 1, py: 0.3, bgcolor: '#e2e8f0', borderRadius: 1, fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                        {data.length.toLocaleString()}
                    </Box>
                )}
            </Box>

            {/* Grid */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        {/* Skeleton header */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, px: 0.5 }}>
                            {[3, 1.5, 1, 1, 1, 0.8].map((w, i) => (
                                <Skeleton key={i} variant="text" sx={{ flex: w }} height={18} />
                            ))}
                        </Box>
                        {/* Skeleton rows */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 0.75, px: 0.5, opacity: 1 - i * 0.06 }}>
                                {[3, 1.5, 1, 1, 1, 0.8].map((w, j) => (
                                    <Skeleton key={j} variant="rectangular" sx={{ flex: w, borderRadius: 1 }} height={36} />
                                ))}
                            </Box>
                        ))}
                    </Box>
                ) : data.length === 0 ? (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Box sx={{ fontSize: 40, opacity: 0.3 }}>📊</Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>No Data Available</Typography>
                        <Typography sx={{ fontSize: 13, color: '#cbd5e1' }}>Select a data source and entity to view records.</Typography>
                    </Box>
                ) : (
                    <DataGrid
                        rows={data}
                        columns={columns}
                        loading={loading}
                        getRowId={row => row.id ?? row._id ?? `${row.title ?? row.name ?? ''}-${Math.random()}`}
                        initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
                        pageSizeOptions={[25, 50, 100]}
                        disableRowSelectionOnClick
                        density="standard"
                        sx={{
                            border: 'none', fontSize: 13,
                            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', borderBottom: '1px solid #eef0f3' },
                            '& .MuiDataGrid-columnHeaderTitle': HEADER,
                            '& .MuiDataGrid-row': {
                                borderBottom: '1px solid #f1f5f9',
                                '&:hover': { bgcolor: '#f8fafc' },
                                '&:last-child': { borderBottom: 'none' },
                            },
                            '& .MuiDataGrid-cell': { borderColor: 'transparent', color: '#334155', fontSize: 13, alignItems: 'center' },
                            '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #eef0f3', bgcolor: '#f8fafc', minHeight: 44 },
                            '& .MuiDataGrid-selectedRowCount': { fontSize: 12, color: '#94a3b8' },
                            '& .MuiTablePagination-root': { fontSize: 12, color: '#64748b' },
                        }}
                    />
                )}
            </Box>

            <ProductDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} data={selectedItem} sourceType={sourceType} />
        </Box>
    );
}
