import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import logoFull from '../assets/logo PISync.png';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/authService';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) { setError('Please enter your username and password.'); return; }
        setLoading(true);
        setError('');
        try {
            const data = await authService.login({ username, password });
            login(data.access_token);
            navigate('/');
        } catch {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fieldSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            fontSize: 14,
            bgcolor: '#f1f4f8',
            '& fieldset': { border: 'none' },
            '&:hover fieldset': { border: 'none' },
            '&.Mui-focused fieldset': { border: '1.5px solid #0f2d52' },
        },
        '& input::placeholder': { color: '#a0aec0', opacity: 1 },
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fff',
        }}>
            <Box sx={{
                width: '100%',
                maxWidth: 400,
                mx: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Logo — clean top area */}
                <Box sx={{ mb: 5, display: 'flex', justifyContent: 'center' }}>
                    <img src={logoFull} alt="PISync" style={{ height: 100, objectFit: 'contain' }} />
                </Box>

                {/* Form card */}
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>

                    {/* "Sign in" lives inside the form, not above */}
                    <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 400, color: '#a0aec0' }}>
                            Welcome back
                        </Typography>
                        <Typography sx={{ fontSize: 26, fontWeight: 600, color: '#1a202c' }}>
                            Login
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#4a5568', mb: 0.8 }}>Username</Typography>
                        <TextField
                            fullWidth size="small"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoFocus
                            sx={fieldSx}
                            slotProps={{ htmlInput: { style: { padding: '12px 16px' } } }}
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#4a5568', mb: 0.8 }}>Password</Typography>
                        <TextField
                            fullWidth size="small"
                            type={showPwd ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            slotProps={{
                                htmlInput: { style: { padding: '12px 16px' } },
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ mr: 0.5 }}>
                                                {showPwd
                                                    ? <VisibilityOff sx={{ fontSize: 19, color: '#a0aec0' }} />
                                                    : <Visibility sx={{ fontSize: 19, color: '#a0aec0' }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                            sx={fieldSx}
                        />
                    </Box>

                    {error && (
                        <Box sx={{ mb: 2.5, px: 1.5, py: 1, bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 12.5, color: '#e53e3e' }}>{error}</Typography>
                        </Box>
                    )}

                    <Button
                        type="submit" fullWidth variant="contained" disabled={loading}
                        sx={{
                            py: 1.5, borderRadius: 2.5, fontSize: 15, fontWeight: 600,
                            bgcolor: '#0f2d52', textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(15,45,82,0.3)',
                            '&:hover': { bgcolor: '#1a3f6f', boxShadow: '0 6px 18px rgba(15,45,82,0.35)' },
                            '&:disabled': { bgcolor: '#a0aec0', boxShadow: 'none' },
                        }}
                    >
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
