import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import ROUTES from '../config/routes';
import CloudflareTurnstile from '../components/CloudflareTurnstile';
import { useTurnstile } from '../hooks/useTurnstile';

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { token: turnstileToken, error: turnstileError, handleVerify, handleError, handleExpire } = useTurnstile();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check Turnstile verification
    if (!turnstileToken) {
      setError('Please complete the verification challenge');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        ...formData,
        turnstileToken
      });
      setAuth(response.user, response.token);

      // TODO: Redirect based on user role
      // - If role is 'admin', redirect to management panel
      // - If role is 'customer', redirect to customer portal/home
      if (response.user.role === 'admin') {
        // TODO: Implement management panel route
        navigate(ROUTES.HOME); // Temporary redirect to home
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'grey.100',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight={600}>
            Login
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Welcome back! Please login to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {turnstileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {turnstileError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
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
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />

            <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'center' }}>
              <CloudflareTurnstile
                siteKey={siteKey}
                onVerify={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
                theme="light"
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2, py: 1.5 }}
              disabled={loading || !turnstileToken}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to={ROUTES.SIGNUP}
                  style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;
