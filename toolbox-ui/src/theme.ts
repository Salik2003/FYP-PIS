import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 14,
        button: { textTransform: 'none', fontWeight: 500 },
    },
    palette: {
        primary: { main: '#2563eb', dark: '#1d4ed8', light: '#60a5fa' },
        secondary: { main: '#0f2d52' },
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' },
        divider: '#eef0f3',
        success: { main: '#059669', light: '#ecfdf5' },
        warning: { main: '#d97706', light: '#fffbeb' },
        error: { main: '#dc2626', light: '#fef2f2' },
    },
    shape: { borderRadius: 8 },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { fontFamily: '"Inter", sans-serif', fontSize: 14 },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: { textTransform: 'none', fontWeight: 500, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
                contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
            },
            defaultProps: { disableElevation: true },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 600, fontSize: 12 },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    fontSize: 13.5,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: { fontSize: 13.5 },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: { fontSize: 13.5 },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { fontSize: 13.5, borderColor: '#f1f5f9' },
                head: { fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#f8fafc' },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { fontSize: 12, borderRadius: 6, bgcolor: '#1e293b' },
            },
        },
    },
});

export default theme;
