import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2rem', fontWeight: 600 },
        h2: { fontSize: '1.5rem', fontWeight: 600 },
        h3: { fontSize: '1.25rem', fontWeight: 600 },
    },
    palette: {
        primary: {
            main: '#4da5ff', // Matching Tailwind
            dark: '#0284c7',
            light: '#bae6fd',
        },
        secondary: {
            main: '#714B67',
        },
        background: {
            default: '#f8fafc', // Slate-50
            paper: '#ffffff',
        },
        text: {
            primary: '#0f172a', // Slate-900
            secondary: '#475569', // Slate-600
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' // Tailwind shadow-sm
                }
            }
        }
    },
});

export default theme;
