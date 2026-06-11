import { useState, useEffect } from 'react';
import {
    Box, Typography, Drawer, IconButton, Stack, Divider,
    Grid, Chip, Paper, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { complianceService, type ComplianceRecord } from '../../services/complianceService';

const STATUS_CONFIG = {
    COMPLIANT:     { label: 'Compliant',    color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> },
    UNDER_REVIEW:  { label: 'Under Review', color: 'warning' as const, icon: <HourglassTopIcon fontSize="small" /> },
    NON_COMPLIANT: { label: 'Non-Compliant',color: 'error'   as const, icon: <ErrorIcon fontSize="small" /> },
};

interface ProductDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    data: any;
    sourceType?: string;
}

function Field({ label, value }: { label: string; value?: any }) {
    return (
        <Box>
            <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>{label}</Typography>
            <Typography sx={{ fontSize: 13.5, color: '#1e293b', fontWeight: 500 }}>{value ?? '—'}</Typography>
        </Box>
    );
}

export default function ProductDetailDrawer({ open, onClose, data, sourceType }: ProductDetailDrawerProps) {
    const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
    const [complianceLoading, setComplianceLoading] = useState(false);

    const isShopifyOrder = data && Array.isArray(data.line_items);
    const isOdooOrder = sourceType === 'odoo' && data && data.partner_id !== undefined && !isShopifyOrder;
    const isOdoo = sourceType === 'odoo';

    useEffect(() => {
        if (!open || !data || isShopifyOrder || isOdooOrder || isOdoo) return;
        const sku = data.variants?.[0]?.sku;
        if (!sku) return;
        setComplianceLoading(true);
        complianceService.getAll(sku)
            .then(setComplianceRecords)
            .catch(() => setComplianceRecords([]))
            .finally(() => setComplianceLoading(false));
    }, [open, data]);

    if (!data) return null;

    // Shopify product fields
    const { title, product_type, vendor, status, images, image, variants, tags, created_at } = data;
    const mainImage = images?.[0]?.src || image?.src || null;

    // Shopify order fields
    const { name, email, customer, shipping_address, line_items, total_price, currency, financial_status, fulfillment_status } = data;

    // Odoo helpers
    const resolve = (v: any) => Array.isArray(v) ? v[1] : v;

    const drawerTitle = isShopifyOrder ? 'Order Details'
        : isOdooOrder ? 'Sales Order Details'
        : isOdoo ? 'Product Details'
        : 'Product Details';

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: '100%', sm: 500, md: 580 }, p: 0 } }}
        >
            {/* Header */}
            <Box sx={{
                px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid #eef0f3', position: 'sticky', top: 0, bgcolor: '#fff', zIndex: 10,
            }}>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{drawerTitle}</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', '&:hover': { color: '#1e293b' } }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: 'auto' }}>

                {/* ── SHOPIFY ORDER ── */}
                {isShopifyOrder && (
                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="h5" fontWeight={800}>{name}</Typography>
                                <Typography variant="caption" color="text.secondary">{new Date(created_at).toLocaleString()}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Chip label={financial_status} color={financial_status === 'paid' ? 'success' : 'warning'} size="small" sx={{ textTransform: 'capitalize' }} />
                                <Chip label={fulfillment_status || 'Unfulfilled'} color={fulfillment_status === 'fulfilled' ? 'success' : 'default'} variant="outlined" size="small" sx={{ textTransform: 'capitalize' }} />
                            </Stack>
                        </Paper>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Customer</Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {customer ? `${customer.first_name || ''} ${customer.last_name || ''}` : 'Guest'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{email || customer?.email}</Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Shipping To</Typography>
                                    <Typography variant="body2">
                                        {shipping_address ? (
                                            <>{shipping_address.address1}<br />{shipping_address.city}, {shipping_address.province_code} {shipping_address.zip}<br />{shipping_address.country}</>
                                        ) : 'No shipping address'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Items</Typography>
                            <Stack spacing={1}>
                                {line_items?.map((item: any, i: number) => (
                                    <Paper key={item.id || i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                        <Grid container alignItems="center">
                                            <Grid size={8}>
                                                <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.variant_title !== 'Default Title' ? item.variant_title : ''} • SKU: {item.sku || '-'}
                                                </Typography>
                                            </Grid>
                                            <Grid size={4} sx={{ textAlign: 'right' }}>
                                                <Typography variant="body2" fontWeight={600}>{item.quantity} x {item.price}</Typography>
                                                <Typography variant="caption" color="text.secondary">Total: {(item.quantity * parseFloat(item.price)).toFixed(2)}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 200, bgcolor: '#f8fafc' }}>
                                <Stack direction="row" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2">Subtotal</Typography>
                                    <Typography variant="body2" fontWeight={600}>{data.subtotal_price} {currency}</Typography>
                                </Stack>
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
                                    <Typography variant="subtitle1" fontWeight={700}>{total_price} {currency}</Typography>
                                </Stack>
                            </Paper>
                        </Box>
                    </Stack>
                )}

                {/* ── ODOO SALES ORDER ── */}
                {isOdooOrder && (
                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{data.name}</Typography>
                                {data.date_order && (
                                    <Typography variant="caption" color="text.secondary">{new Date(data.date_order).toLocaleString()}</Typography>
                                )}
                            </Stack>
                            {data.state && (() => {
                                const map: Record<string, [string, string, string]> = {
                                    sale: ['#ecfdf5', '#059669', 'Confirmed'],
                                    done: ['#eff6ff', '#2563eb', 'Done'],
                                    draft: ['#f3f4f6', '#64748b', 'Quotation'],
                                    cancel: ['#fef2f2', '#dc2626', 'Cancelled'],
                                };
                                const [bg, color, label] = map[data.state] ?? ['#f3f4f6', '#64748b', data.state];
                                return <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.4, borderRadius: 1, bgcolor: bg, fontSize: 12, fontWeight: 700, color }}>{label}</Box>;
                            })()}
                        </Paper>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Field label="Customer" value={resolve(data.partner_id)} />
                            <Field label="Total" value={`${resolve(data.currency_id) || ''} ${Number(data.amount_total || 0).toFixed(2)}`} />
                            <Field label="Untaxed Amount" value={`${Number(data.amount_untaxed || 0).toFixed(2)}`} />
                            <Field label="Tax" value={`${Number(data.amount_tax || 0).toFixed(2)}`} />
                            {data.user_id && <Field label="Salesperson" value={resolve(data.user_id)} />}
                            {data.payment_term_id && <Field label="Payment Terms" value={resolve(data.payment_term_id)} />}
                        </Box>

                        {data.note && (
                            <>
                                <Divider />
                                <Field label="Notes" value={data.note} />
                            </>
                        )}
                    </Stack>
                )}

                {/* ── ODOO PRODUCT ── */}
                {isOdoo && !isOdooOrder && (
                    <Stack spacing={3}>
                        <Box>
                            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{data.name}</Typography>
                            {data.default_code && (
                                <Box sx={{ display: 'inline-flex', px: 1.5, py: 0.3, bgcolor: '#f1f5f9', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                                    SKU: {data.default_code}
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                            <Field label="Sales Price" value={`$${Number(data.list_price || 0).toFixed(2)}`} />
                            <Field label="Cost" value={data.standard_price != null ? `$${Number(data.standard_price).toFixed(2)}` : undefined} />
                            <Field label="Type" value={({ product: 'Storable Product', consu: 'Consumable', service: 'Service' } as Record<string, string>)[data.type] ?? data.type} />
                            <Field label="Category" value={resolve(data.categ_id)} />
                            <Field label="Unit of Measure" value={resolve(data.uom_id)} />
                            <Field label="Purchase UoM" value={resolve(data.uom_po_id)} />
                            {data.barcode && <Field label="Barcode" value={data.barcode} />}
                            {data.sale_ok !== undefined && <Field label="Can be Sold" value={data.sale_ok ? 'Yes' : 'No'} />}
                            {data.purchase_ok !== undefined && <Field label="Can be Purchased" value={data.purchase_ok ? 'Yes' : 'No'} />}
                        </Box>

                        {data.description_sale && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Sales Description</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{data.description_sale}</Typography>
                                </Box>
                            </>
                        )}

                        {data.description && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Internal Notes</Typography>
                                    <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{data.description}</Typography>
                                </Box>
                            </>
                        )}
                    </Stack>
                )}

                {/* ── SHOPIFY PRODUCT ── */}
                {!isShopifyOrder && !isOdoo && (
                    <Stack spacing={2} sx={{ mb: 4 }}>
                        <Box sx={{ width: '100%', height: 260, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {mainImage
                                ? <Box component="img" src={mainImage} alt={title} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                : <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: 32, mb: 0.5 }}>📦</Typography>
                                    <Typography sx={{ fontSize: 12, color: '#cbd5e1' }}>No image available</Typography>
                                  </Box>
                            }
                        </Box>

                        <Box>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {status && <Chip label={status} color={status === 'active' ? 'success' : 'default'} size="small" variant="outlined" />}
                                {product_type && <Chip label={product_type} color="primary" size="small" variant="outlined" />}
                            </Stack>
                            <Typography variant="h5" fontWeight={700} gutterBottom>{title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Vendor: <Box component="span" fontWeight={600} color="text.primary">{vendor}</Box>
                            </Typography>
                        </Box>

                        <Divider />

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Variants & Inventory</Typography>
                        {variants && variants.length > 0 ? (
                            <Stack spacing={1} sx={{ mb: 2 }}>
                                {variants.map((v: any, index: number) => (
                                    <Paper key={v.id || index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="body2" fontWeight={600}>{v.title !== 'Default Title' ? v.title : 'Standard Variant'}</Typography>
                                                <Typography variant="caption" color="text.secondary">SKU: {v.sku || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { sm: 'right' } }}>
                                                <Typography variant="body2" color={v.inventory_quantity > 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                                                    {v.inventory_quantity} in stock
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">${v.price}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No variants info.</Typography>
                        )}

                        <Divider />

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Metadata</Typography>
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Tags</Typography>
                                <Typography variant="body2">{tags || '-'}</Typography>
                            </Grid>
                            <Grid size={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Created At</Typography>
                                <Typography variant="body2">{created_at ? new Date(created_at).toLocaleDateString() : '-'}</Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Compliance Records</Typography>
                        {complianceLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
                        ) : complianceRecords.length > 0 ? (
                            <Stack spacing={1}>
                                {complianceRecords.map((r) => {
                                    const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.UNDER_REVIEW;
                                    return (
                                        <Paper key={r.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                <Box>
                                                    <Typography variant="caption" fontWeight={600} color="text.primary">{r.regulation}</Typography>
                                                    {r.notes && <Typography variant="caption" display="block" color="text.secondary">{r.notes}</Typography>}
                                                </Box>
                                                <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600, flexShrink: 0 }} />
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No compliance records for this SKU.</Typography>
                        )}
                    </Stack>
                )}
            </Box>
        </Drawer>
    );
}
