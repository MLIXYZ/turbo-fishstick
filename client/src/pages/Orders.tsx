import { useState, useEffect, useCallback } from 'react'
import {
    Container,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    List,
    ListItem,
    Card,
    CardContent,
    Chip,
    Button,
    Collapse,
    IconButton,
} from '@mui/material'
import { ExpandMore, ExpandLess, ContentCopy } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'
import ProfileHeader from '../components/ProfileHeader.tsx'

interface Product {
    id: number
    title: string
    image_url?: string
    platform?: string
}

interface OrderItem {
    id: number
    product_id: number
    quantity: number
    price: number
    subtotal: number
    product?: Product
}

interface StockKey {
    id: number
    game_key: string
    product_id: number
    status: string
    assigned_at: string
}

interface Order {
    id: number
    order_number: string
    status: string
    subtotal: number
    tax: number
    discount: number
    total: number
    payment_status: string
    payment_method: string
    created_at: string
    items?: OrderItem[]
    stock_keys?: StockKey[]
}

export default function Orders() {
    const navigate = useNavigate()
    const { user: authUser, isAuthenticated } = useAuthStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
    const [copiedKey, setCopiedKey] = useState<number | null>(null)

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/orders')
            setOrders(response.data)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching orders', err)
            setError('Failed to load orders')
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated || !authUser) {
            navigate(ROUTES.LOGIN)
            return
        }

        void fetchOrders()
    }, [isAuthenticated, authUser, navigate, fetchOrders])

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const toggleOrderExpansion = (orderId: number) => {
        setExpandedOrders((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(orderId)) {
                newSet.delete(orderId)
            } else {
                newSet.add(orderId)
            }
            return newSet
        })
    }

    const copyToClipboard = async (keyId: number, gameKey: string) => {
        try {
            await navigator.clipboard.writeText(gameKey)
            setCopiedKey(keyId)
            setTimeout(() => setCopiedKey(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (loading) {
        return (
            <Box>
                <ProfileHeader />
                <Container
                    maxWidth="lg"
                    sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}
                >
                    <CircularProgress />
                </Container>
            </Box>
        )
    }

    if (error) {
        return (
            <Box>
                <ProfileHeader />
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Alert severity="error">{error}</Alert>
                </Container>
            </Box>
        )
    }

    return (
        <Box>
            <ProfileHeader />
            <Box sx={{ flexGrow: 1, p: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                        📦 My Orders
                    </Typography>

                    {orders.length === 0 ? (
                        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                            >
                                No orders yet
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Start shopping to see your order history!
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate(ROUTES.HOME)}
                            >
                                Browse Games
                            </Button>
                        </Paper>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {orders.map((order) => (
                                <Card
                                    key={order.id}
                                    elevation={3}
                                    sx={{ mb: 3 }}
                                >
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid size={{ xs: 12, md: 8 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    {order.order_number}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ mt: 0.5 }}
                                                >
                                                    Placed on:{' '}
                                                    {formatDate(order.created_at)}
                                                </Typography>
                                            </Grid>
                                            <Grid
                                                size={{ xs: 12, md: 4 }}
                                                sx={{
                                                    textAlign: {
                                                        xs: 'left',
                                                        md: 'right',
                                                    },
                                                }}
                                            >
                                                <Chip
                                                    label={order.status.toUpperCase()}
                                                    color={
                                                        order.status === 'completed'
                                                            ? 'success'
                                                            : order.status ===
                                                                  'pending'
                                                              ? 'warning'
                                                              : 'error'
                                                    }
                                                    sx={{ mb: 1 }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    ${Number(order.total).toFixed(2)}
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Divider sx={{ my: 2 }} />

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Payment: {order.payment_method} -{' '}
                                                    {order.payment_status}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {order.items?.length || 0}{' '}
                                                    item(s) |{' '}
                                                    {order.stock_keys?.length || 0}{' '}
                                                    key(s)
                                                </Typography>
                                            </Box>
                                            <Button
                                                endIcon={
                                                    expandedOrders.has(order.id) ? (
                                                        <ExpandLess />
                                                    ) : (
                                                        <ExpandMore />
                                                    )
                                                }
                                                onClick={() =>
                                                    toggleOrderExpansion(order.id)
                                                }
                                            >
                                                {expandedOrders.has(order.id)
                                                    ? 'Hide Details'
                                                    : 'View Details'}
                                            </Button>
                                        </Box>

                                        <Collapse
                                            in={expandedOrders.has(order.id)}
                                            timeout="auto"
                                            unmountOnExit
                                        >
                                            <Box sx={{ mt: 3 }}>
                                                {/* Order Items */}
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight="bold"
                                                    sx={{ mb: 2 }}
                                                >
                                                    Items
                                                </Typography>
                                                {order.items?.map((item) => (
                                                    <Box
                                                        key={item.id}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mb: 2,
                                                            p: 2,
                                                            bgcolor: 'grey.50',
                                                            borderRadius: 1,
                                                        }}
                                                    >
                                                        {item.product?.image_url && (
                                                            <Box
                                                                component="img"
                                                                src={
                                                                    item.product
                                                                        .image_url
                                                                }
                                                                alt={
                                                                    item.product.title
                                                                }
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 1,
                                                                    mr: 2,
                                                                }}
                                                            />
                                                        )}
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography
                                                                variant="body1"
                                                                fontWeight="bold"
                                                            >
                                                                {item.product?.title ||
                                                                    `Product #${item.product_id}`}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                {item.product?.platform}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                            >
                                                                Quantity: {item.quantity}{' '}
                                                                × $
                                                                {Number(
                                                                    item.price
                                                                ).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="bold"
                                                        >
                                                            $
                                                            {Number(item.subtotal).toFixed(
                                                                2
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                ))}

                                                {/* Game Keys */}
                                                {order.stock_keys &&
                                                    order.stock_keys.length > 0 && (
                                                        <>
                                                            <Divider sx={{ my: 2 }} />
                                                            <Typography
                                                                variant="subtitle1"
                                                                fontWeight="bold"
                                                                sx={{ mb: 2 }}
                                                            >
                                                                🔑 Your Game Keys
                                                            </Typography>
                                                            {order.stock_keys.map(
                                                                (key) => (
                                                                    <Box
                                                                        key={key.id}
                                                                        sx={{
                                                                            display:
                                                                                'flex',
                                                                            alignItems:
                                                                                'center',
                                                                            justifyContent:
                                                                                'space-between',
                                                                            mb: 1,
                                                                            p: 2,
                                                                            bgcolor:
                                                                                'success.50',
                                                                            borderRadius: 1,
                                                                            border: 1,
                                                                            borderColor:
                                                                                'success.200',
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                flexGrow: 1,
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                sx={{
                                                                                    mb: 0.5,
                                                                                }}
                                                                            >
                                                                                Product
                                                                                #
                                                                                {
                                                                                    key.product_id
                                                                                }
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="body1"
                                                                                fontFamily="monospace"
                                                                                fontWeight="bold"
                                                                            >
                                                                                {
                                                                                    key.game_key
                                                                                }
                                                                            </Typography>
                                                                        </Box>
                                                                        <IconButton
                                                                            onClick={() =>
                                                                                copyToClipboard(
                                                                                    key.id,
                                                                                    key.game_key
                                                                                )
                                                                            }
                                                                            color={
                                                                                copiedKey ===
                                                                                key.id
                                                                                    ? 'success'
                                                                                    : 'primary'
                                                                            }
                                                                        >
                                                                            <ContentCopy />
                                                                        </IconButton>
                                                                    </Box>
                                                                )
                                                            )}
                                                        </>
                                                    )}

                                                {/* Order Summary */}
                                                <Divider sx={{ my: 2 }} />
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'flex-end',
                                                    }}
                                                >
                                                    <Box sx={{ minWidth: 200 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                                mb: 1,
                                                            }}
                                                        >
                                                            <Typography variant="body2">
                                                                Subtotal:
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                $
                                                                {Number(
                                                                    order.subtotal
                                                                ).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                        {order.discount > 0 && (
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent:
                                                                        'space-between',
                                                                    mb: 1,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    color="success.main"
                                                                >
                                                                    Discount:
                                                                </Typography>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="success.main"
                                                                >
                                                                    -$
                                                                    {Number(
                                                                        order.discount
                                                                    ).toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                                mb: 1,
                                                            }}
                                                        >
                                                            <Typography variant="body2">
                                                                Tax:
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                $
                                                                {Number(order.tax).toFixed(
                                                                    2
                                                                )}
                                                            </Typography>
                                                        </Box>
                                                        <Divider sx={{ my: 1 }} />
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'space-between',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body1"
                                                                fontWeight="bold"
                                                            >
                                                                Total:
                                                            </Typography>
                                                            <Typography
                                                                variant="body1"
                                                                fontWeight="bold"
                                                            >
                                                                $
                                                                {Number(
                                                                    order.total
                                                                ).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </CardContent>
                                </Card>
                            ))}
                        </List>
                    )}
                </Container>
            </Box>
        </Box>
    )
}
