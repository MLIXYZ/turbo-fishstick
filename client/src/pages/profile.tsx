import { useState, useEffect, useCallback } from 'react'
import {
    Container,
    CircularProgress,
    Alert,
    Box,
    Avatar,
    Paper,
    Typography,
    Grid,
    Divider,
    List,
    ListItem,
    Card,
} from '@mui/material'
import { Person } from '@mui/icons-material'
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
