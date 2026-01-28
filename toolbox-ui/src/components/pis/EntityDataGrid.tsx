import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Paper, Typography, Box, Button, Chip, Stack } from '@mui/material';
import { useMemo, useState, useCallback } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ProductDetailDrawer from './ProductDetailDrawer';

interface EntityDataGridProps {
    data: any[];
    loading: boolean;
    entityName?: string;
}

export default function EntityDataGrid({ data, loading, entityName }: EntityDataGridProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleViewDetail = useCallback((item: any) => {
        setSelectedItem(item);
        setDrawerOpen(true);
    }, []);

    // Dynamically generate columns based on the first data item
    const columns = useMemo<GridColDef[]>(() => {
        if (!data || !data.length) return [];

        // Custom Layout for "Product" Entity
        if (entityName?.toLowerCase() === 'product') {
            return [
                {
                    field: 'title',
                    headerName: 'NAME',
                    flex: 2,
                    minWidth: 200,
                    renderCell: (params) => (
                        <Box sx={{ fontWeight: 600, color: '#1e293b' }}>{params.value}</Box>
                    )
                },
                {
                    field: 'sku',
                    headerName: 'SKU',
                    flex: 1,
                    minWidth: 120,
                    valueGetter: (params, row) => {
                        // Extract SKU from first variant or join multiple
                        if (row.variants && row.variants.length > 0) {
                            return row.variants[0].sku || 'N/A';
                        }
                        return 'N/A';
                    }
                },
                {
                    field: 'quantity',
                    headerName: 'QUANTITY',
                    flex: 1,
                    minWidth: 100,
                    valueGetter: (params, row) => {
                        // Sum inventory from all variants
                        if (row.variants && row.variants.length > 0) {
                            return row.variants.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0);
                        }
                        return 0;
                    },
                    renderCell: (params) => (
                        <Chip
                            label={params.value}
                            size="small"
                            color={params.value > 0 ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: 1 }}
                        />
                    )
                },
                {
                    field: 'vendor',
                    headerName: 'VENDOR',
                    flex: 1,
                    minWidth: 120,
                },
                {
                    field: 'product_type',
                    headerName: 'TYPE',
                    flex: 1,
                    minWidth: 120,
                },
                {
                    field: 'actions',
                    headerName: 'ACTIONS',
                    width: 120,
                    sortable: false,
                    renderCell: (params) => (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(params.row);
                            }}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: '#eff6ff',
                                color: '#3b82f6',
                                '&:hover': { bgcolor: '#dbeafe', boxShadow: 'none' }
                            }}
                        >
                            View
                        </Button>
                    )
                }
            ];
        }

        // Custom Layout for "Order" Entity
        if (entityName?.toLowerCase() === 'order') {
            return [
                {
                    field: 'name',
                    headerName: 'ORDER',
                    width: 120,
                    renderCell: (params) => (
                        <Box sx={{ fontWeight: 700, color: '#1e293b' }}>{params.value}</Box>
                    )
                },
                {
                    field: 'customer',
                    headerName: 'CUSTOMER',
                    flex: 1,
                    minWidth: 150,
                    valueGetter: (params, row) => {
                        if (row.customer) {
                            return `${row.customer.first_name || ''} ${row.customer.last_name || ''}`.trim() || row.customer.email || 'Guest';
                        }
                        return 'N/A';
                    }
                },
                {
                    field: 'total_price',
                    headerName: 'TOTAL',
                    width: 120,
                    valueGetter: (params, row) => {
                        return row.total_price || '0.00';
                    },
                    renderCell: (params) => (
                        <Box sx={{ fontWeight: 600 }}>{params.value} {params.row.currency || ''}</Box>
                    )
                },
                {
                    field: 'financial_status',
                    headerName: 'PAYMENT',
                    width: 130,
                    renderCell: (params) => {
                        const status = params.value;
                        let color: 'success' | 'warning' | 'error' | 'default' = 'default';
                        if (status === 'paid') color = 'success';
                        else if (status === 'pending' || status === 'partially_paid') color = 'warning';
                        else if (status === 'voided' || status === 'refunded') color = 'error';

                        return <Chip label={status} size="small" color={color} variant="filled" sx={{ borderRadius: 1, textTransform: 'capitalize', height: 24 }} />;
                    }
                },
                {
                    field: 'fulfillment_status',
                    headerName: 'FULFILLMENT',
                    width: 140,
                    renderCell: (params) => {
                        const status = params.value || 'unfulfilled';
                        let color: 'success' | 'warning' | 'info' | 'default' = 'default';
                        if (status === 'fulfilled') color = 'success';
                        else if (status === 'partial') color = 'warning';
                        return <Chip label={status} size="small" color={color} variant="outlined" sx={{ borderRadius: 1, textTransform: 'capitalize', height: 24 }} />;
                    }
                },
                {
                    field: 'created_at',
                    headerName: 'DATE',
                    width: 150,
                    valueGetter: (params, row) => new Date(row.created_at).toLocaleDateString()
                },
                {
                    field: 'actions',
                    headerName: 'ACTIONS',
                    width: 120,
                    sortable: false,
                    renderCell: (params) => (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(params.row);
                            }}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                bgcolor: '#eff6ff',
                                color: '#3b82f6',
                                '&:hover': { bgcolor: '#dbeafe', boxShadow: 'none' }
                            }}
                        >
                            View
                        </Button>
                    )
                }
            ];
        }

        // Generic Fallback for other entities
        const firstItem = data[0];
        const keys = Object.keys(firstItem);

        // Filter out bulky or unnecessary fields
        const excludeKeys = [
            'body_html', 'admin_graphql_api_id', 'images', 'image', 'variants',
            'options', 'customer', 'line_items', 'billing_address', 'shipping_address',
            'payment_gateway_names', 'note_attributes', 'tags', 'published_at', 'token',
            'cart_token', 'checkout_token', 'landing_site', 'referring_site'
        ];

        const filteredKeys = keys.filter(key => !excludeKeys.includes(key));

        // Limit number of columns to prevent extreme horizontal scroll
        const limitedKeys = filteredKeys.slice(0, 8);


        const cols: GridColDef[] = limitedKeys.map((key) => ({
            field: key,
            headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const value = params.value;
                if (typeof value === 'object' && value !== null) {
                    return JSON.stringify(value).substring(0, 30) + '...';
                }
                return value;
            }
        }));

        return cols;
    }, [data, entityName, handleViewDetail]);


    return (
        <Paper elevation={0} sx={{ height: '100%', width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Table Header Area */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {entityName ? `${entityName} Records` : 'Entity Records'}
                    {data.length > 0 && (
                        <Box component="span" sx={{ fontSize: '0.75rem', px: 1, py: 0.25, bgcolor: '#e2e8f0', borderRadius: 1, color: '#475569' }}>
                            {data.length}
                        </Box>
                    )}
                </Typography>
                {/* Could add search or refresh here */}
            </Box>

            {/* Data Grid Context - flexible height, internal scroll */}
            <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
                {data.length === 0 && !loading ? (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: '#fcfcfc' }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                            <Box sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}>📊</Box>
                            <Typography variant="h6" gutterBottom fontWeight={600}>No Data Available</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please ensure the selected Data Source and Entity have records synchronized.
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <DataGrid
                        rows={data}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id || row._id || Math.random().toString(36).substring(7)}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 50, page: 0 },
                            },
                        }}
                        pageSizeOptions={[25, 50, 100]}
                        disableRowSelectionOnClick
                        density="standard"
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-main': { overflow: 'hidden' }, // Let virtual scroller handle it
                            '& .MuiDataGrid-virtualScroller': { overflowY: 'auto !important' },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                color: '#1e293b',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                            },
                            '& .MuiDataGrid-row': {
                                borderBottom: '1px solid #f1f5f9',
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                }
                            },
                            '& .MuiDataGrid-cell': {
                                borderColor: 'transparent', // Cleaner look
                                color: '#334155',
                                fontSize: '0.875rem',
                                py: 1
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '1px solid #e2e8f0',
                                backgroundColor: '#fff',
                            }
                        }}
                    />
                )}
            </Box>
            <ProductDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                data={selectedItem}
            />
        </Paper>
    );
}
