import {
    Typography,
    Paper,
    Box,
    Chip,
    Button,
    Toolbar
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import { mockUsers } from '../types/admin.types';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
        field: 'role',
        headerName: 'Role',
        width: 130,
        renderCell: (params) => (
            <Chip
                label={params.value as string}
                color={params.value === 'ADMIN' ? 'secondary' : 'default'}
                size="small"
            />
        )
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 130,
        renderCell: (params) => (
            <Chip
                label={params.value as string}
                color={params.value === 'ACTIVE' ? 'success' : 'default'}
                size="small"
                variant="outlined"
            />
        )
    },
    {
        field: 'lastLogin',
        headerName: 'Last Login',
        width: 200,
        valueFormatter: (value: any) => new Date(value).toLocaleString(),
    },
];

export default function AdminDashboard() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Toolbar disableGutters sx={{ mb: 2 }}>
                <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                    User Management
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />}>
                    Add User
                </Button>
            </Toolbar>

            <Paper sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={mockUsers}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                    disableRowSelectionOnClick
                />
            </Paper>
        </Box>
    );
}
