import { useState, useEffect, useCallback } from 'react'
import {
    Container,
    CircularProgress,
    Alert,
    AlertTitle,
    Box,
    Avatar,
    Paper,
    Typography,
    Grid,
    Divider,
    List,
    ListItem,
    Card,
    TextField,
    Button,
    IconButton,
    InputAdornment,
} from '@mui/material'
import { Person, Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'
import ProfileHeader from '../components/ProfileHeader.tsx'

interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    username: string
    phone: string
    avatar_url?: string
    is_verified: boolean
    last_login: string
    created_at: string
    updated_at: string
}
interface Order {
    id: number
    user_id: number
    order_number: string
    status: string
    subtotal: number
    tax: number
    discount: number
    total: number
    payment_status: string
    created_at: string
    payment_method: string
}

export default function Profile() {
    const navigate = useNavigate()
    const { user: authUser, isAuthenticated } = useAuthStore()
    const [user, setUser] = useState<User | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Password update state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
    const [updatingPassword, setUpdatingPassword] = useState(false)

    const fetchInfo = useCallback(async () => {
        if (!authUser) return
        try {
            setLoading(true)
            const response = await api.get(`/users/${authUser.id}`)
            setUser(response.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching info', err)
            setError('Failed to load info')
            setLoading(false)
        }
    }, [authUser])

    const fetchOrders = useCallback(async () => {
        if (!authUser) return
        try {
            const response = await api.get(`/users/${authUser.id}/orders`)
            setOrders(response.data)
        } catch (err) {
            console.error('Error fetching orders', err)
            setError('Failed to load orders')
        }
    }, [authUser])

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated || !authUser) {
            navigate(ROUTES.LOGIN)
            return
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchInfo()
        // Only fetch orders for non-admin users
        if (authUser.role !== 'admin') {
            void fetchOrders()
        }
    }, [isAuthenticated, authUser, navigate, fetchInfo, fetchOrders])

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const handleUpdatePassword = async () => {
        setPasswordError(null)
        setPasswordSuccess(null)

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required')
            return
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters long')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        try {
            setUpdatingPassword(true)
            await api.put('/auth/update-password', {
                currentPassword,
                newPassword,
            })

            setPasswordSuccess('Password updated successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')

            // Clear success message after 5 seconds
            setTimeout(() => {
                setPasswordSuccess(null)
            }, 5000)
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.error || 'Failed to update password'
            setPasswordError(errorMessage)
        } finally {
            setUpdatingPassword(false)
        }
    }

    if (loading) {
        return (
            <Container
                maxWidth="lg"
                sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
            >
                <CircularProgress />
            </Container>
        )
    }
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        )
    }

    return (
        <Box>
            <ProfileHeader />
            <Box sx={{ flexGrow: 1, p: 4 }}>
                <Grid container spacing={3}>
                    {/* user info */}
                    <Grid
                        size={{
                            xs: 12,
                            md: authUser?.role === 'admin' ? 12 : 4,
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    mb: 2,
                                }}
                                src={user?.avatar_url}
                            >
                                <Person sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h4"
                                    align="center"
                                    sx={{ mb: 1 }}
                                >
                                    {user?.first_name} {user?.last_name}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mb: 1 }}
                                >
                                    {user?.email}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 3 }}
                                >
                                    Member since{' '}
                                    {formatDate(user?.created_at as string)}
                                    <br />
                                    Last login:{' '}
                                    {formatDate(user?.last_login as string)}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Password Update Section */}
                        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h5" fontWeight="bold">
                                🔒 Update Password
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {passwordSuccess && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    <AlertTitle>Success</AlertTitle>
                                    {passwordSuccess}
                                </Alert>
                            )}

                            {passwordError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    <AlertTitle>Error</AlertTitle>
                                    {passwordError}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Current Password"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                margin="normal"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword
                                                    )
                                                }
                                                edge="end"
                                            >
                                                {showCurrentPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="New Password"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                margin="normal"
                                helperText="Must be at least 8 characters"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword
                                                    )
                                                }
                                                edge="end"
                                            >
                                                {showNewPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                margin="normal"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                edge="end"
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handleUpdatePassword}
                                disabled={updatingPassword}
                                sx={{ mt: 3 }}
                            >
                                {updatingPassword
                                    ? 'Updating Password...'
                                    : 'Update Password'}
                            </Button>
                        </Paper>
                    </Grid>

                    {/* user orders - Only show for non-admin users */}
                    {authUser?.role !== 'admin' && (
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    📦 Order History
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {orders.length === 0 ? (
                                    <Typography
                                        color="text.secondary"
                                        sx={{ textAlign: 'center', py: 4 }}
                                    >
                                        No orders yet. Start shopping to see
                                        your order history!
                                    </Typography>
                                ) : (
                                    <List>
                                        {orders.map((order, index) => (
                                            <Card
                                                key={order.id}
                                                variant="outlined"
                                                sx={{ mb: 1 }}
                                            >
                                                <ListItem
                                                    sx={{
                                                        px: 2,
                                                        py: 2,
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'space-between',
                                                            width: '100%',
                                                            gap: 2,
                                                            mb: 1,
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                gutterBottom
                                                            >
                                                                {
                                                                    order.order_number
                                                                }
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                Payment Method:{' '}
                                                                {
                                                                    order.payment_method
                                                                }
                                                                <br />
                                                                <br />
                                                                Payment Status:{' '}
                                                                {
                                                                    order.payment_status
                                                                }
                                                                <br />
                                                                Delivery Status:{' '}
                                                                {order.status}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                color="#666666"
                                                                gutterBottom
                                                            >
                                                                ORDER PLACED:{' '}
                                                                {formatDate(
                                                                    order.created_at as string
                                                                )}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                gutterBottom
                                                            >
                                                                Subtotal: $
                                                                {Number(
                                                                    order.subtotal
                                                                ).toFixed(2)}
                                                                <br />
                                                                Tax: $
                                                                {Number(
                                                                    order.tax
                                                                ).toFixed(2)}
                                                                <br />
                                                                Discount: -$
                                                                {Number(
                                                                    order.discount
                                                                ).toFixed(2)}
                                                                <br />
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight="bold"
                                                            >
                                                                Total: $
                                                                {Number(
                                                                    order.total
                                                                ).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </ListItem>
                                                {index < orders.length - 1 && (
                                                    <Divider />
                                                )}
                                            </Card>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    )
}
