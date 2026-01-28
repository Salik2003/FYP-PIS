import {
    Box,
    Typography,
    Drawer,
    IconButton,
    Stack,
    Divider,
    Grid,
    Chip,
    Paper,
    // Using simple HTML img tag for now or Mui Box with 'component="img"'
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ProductDetailDrawerProps {
    open: boolean;
    onClose: () => void;
    data: any;
}

export default function ProductDetailDrawer({ open, onClose, data }: ProductDetailDrawerProps) {
    if (!data) return null;

    const isOrder = data && Array.isArray(data.line_items);

    const { title, product_type, vendor, status, images, variants, tags, created_at } = data;
    // Order specific fields
    const { name, email, customer, shipping_address, line_items, total_price, currency, financial_status, fulfillment_status } = data;

    const mainImage = images && images.length > 0 ? images[0].src : null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 500, md: 600 }, p: 0 }
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10 }}>
                <Typography variant="h6" fontWeight={700}>
                    {isOrder ? 'Order Details' : 'Product Details'}
                </Typography>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={{ p: 3, overflowY: 'auto' }}>

                {/* --- ORDER VIEW --- */}
                {isOrder ? (
                    <Stack spacing={3}>
                        {/* Order Header Card */}
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

                        {/* Customer & Address */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Customer</Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {customer ? `${customer.first_name || ''} ${customer.last_name || ''}` : 'Guest'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">{email || customer?.email}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Shipping To</Typography>
                                    <Typography variant="body2">
                                        {shipping_address ? (
                                            <>
                                                {shipping_address.address1}<br />
                                                {shipping_address.city}, {shipping_address.province_code} {shipping_address.zip}<br />
                                                {shipping_address.country}
                                            </>
                                        ) : 'No shipping address'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Line Items */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Items</Typography>
                            <Stack spacing={1}>
                                {line_items?.map((item: any, i: number) => (
                                    <Paper key={item.id || i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                        <Grid container alignItems="center">
                                            <Grid item xs={8}>
                                                <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {item.variant_title !== 'Default Title' ? item.variant_title : ''} • SKU: {item.sku || '-'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {item.quantity} x {item.price}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Total: {(item.quantity * parseFloat(item.price)).toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>

                        {/* Totals */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
                ) : (
                    /* --- PRODUCT VIEW --- */
                    <Stack spacing={2} sx={{ mb: 4 }}>
                        {mainImage && (
                            <Box sx={{ width: '100%', height: 300, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <Box component="img" src={mainImage} alt={title} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </Box>
                        )}

                        <Box>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                {status && <Chip label={status} color={status === 'active' ? 'success' : 'default'} size="small" variant="outlined" />}
                                {product_type && <Chip label={product_type} color="primary" size="small" variant="outlined" />}
                            </Stack>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Vendor: <Box component="span" fontWeight={600} color="text.primary">{vendor}</Box>
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        {/* Variants / Inventory */}
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            Variants & Inventory
                        </Typography>
                        {variants && variants.length > 0 ? (
                            <Stack spacing={1} sx={{ mb: 4 }}>
                                {variants.map((v: any, index: number) => (
                                    <Paper key={v.id || index} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" fontWeight={600}>{v.title !== 'Default Title' ? v.title : 'Standard Variant'}</Typography>
                                                <Typography variant="caption" color="text.secondary">SKU: {v.sku || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
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
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>No variants info.</Typography>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Additional Info */}
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                            Metadata
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Tags</Typography>
                                <Typography variant="body2">{tags || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary" display="block">Created At</Typography>
                                <Typography variant="body2">{created_at ? new Date(created_at).toLocaleDateString() : '-'}</Typography>
                            </Grid>
                        </Grid>
                    </Stack>
                )}

            </Box>
        </Drawer>
    );
}
