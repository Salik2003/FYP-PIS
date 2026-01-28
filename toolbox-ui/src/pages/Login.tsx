import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { authService } from '../services/authService';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Real authentication
            const data = await authService.login({ username: email, password }); // Note: Backend expects 'username' but form has 'email'
            // If backend uses username, we map email field to username or ask user for username. 
            // AuthController uses LoginDto { username, password }

            // For now, assuming user types username in email field or we send email as username
            // Let's verify what the input field says. It says "Email Address" but name="email".
            // Backend Admin is "admin". Email is usually not "admin".
            // I should change the label to "Username / Email" or just "Username" to be safe.

            login(data.access_token);
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Typography component="h1" variant="h5">
                        Toolbox 2.0 Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
