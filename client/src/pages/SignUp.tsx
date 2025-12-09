import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Grid,
} from '@mui/material'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import ROUTES from '../config/routes'
import CloudflareTurnstile from '../components/CloudflareTurnstile'
import { useTurnstile } from '../hooks/useTurnstile'

function SignUp() {
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)
    const {
        token: turnstileToken,
        error: turnstileError,
        handleVerify,
        handleError,
        handleExpire,
    } = useTurnstile()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        date_of_birth: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('') // Clear error when user types
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        if (!turnstileToken) {
            setError('Please complete the verification challenge')
            return
        }

        setLoading(true)

        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...signupData } = formData
            const response = await authAPI.signup({
                ...signupData,
                turnstileToken,
            })
            setAuth(response.user, response.token)

            // TODO: Redirect based on user role
            // - If role is 'admin', redirect to management panel
            // - If role is 'customer', redirect to customer portal/home
            if (response.user.role === 'admin') {
                // TODO: Implement management panel route
                navigate(ROUTES.HOME) // Temporary redirect to home
            } else {
                navigate(ROUTES.HOME)
            }
        } catch (err) {
            console.error('Signup error:', err)
            const error = err as { response?: { data?: { error?: string } } }
            setError(
                error.response?.data?.error ||
                    'Failed to create account. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'grey.100',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        align="center"
                        fontWeight={600}
                    >
                        Sign Up
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Create your account to get started
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="first_name"
                                    label="First Name"
                                    name="first_name"
                                    autoComplete="given-name"
                                    autoFocus
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="last_name"
                                    label="Last Name"
                                    name="last_name"
                                    autoComplete="family-name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="phone"
                                    label="Phone Number"
                                    name="phone"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    id="date_of_birth"
                                    label="Date of Birth"
                                    name="date_of_birth"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    helperText="Must be at least 6 characters"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                mt: 3,
                                mb: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
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
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    to={ROUTES.LOGIN}
                                    style={{
                                        color: '#1976d2',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                    }}
                                >
                                    Login
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}

export default SignUp
