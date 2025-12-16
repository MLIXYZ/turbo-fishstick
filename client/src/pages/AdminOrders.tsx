import { useState, useEffect, useCallback } from 'react'
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Grid,
    TextField,
    Card,
    CardContent,
    Stack,
} from '@mui/material'
import {
    Visibility,
    Close,
    Person,
    Receipt,
    Payment,
    LocalShipping,
    CheckCircle,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader.tsx'
import AdminSidebar from '../components/AdminSidebar.tsx'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'
import { formatDateTime } from '../utils/dateFormat'

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
    payment_method: string
    shipping_address?: string
    tracking_number?: string
    created_at: string
    updated_at: string
    user?: {
        id: number
        first_name: string
        last_name: string
        email: string
        phone?: string
    }
}

export default function AdminOrders() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuthStore()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orderStatus, setOrderStatus] = useState('')
    const [paymentStatus, setPaymentStatus] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/admin/orders')
            setOrders(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching orders', error)
            setError('Failed to load orders')
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate(ROUTES.LOGIN)
            return
        }
        if (user.role !== 'admin') {
            navigate(ROUTES.HOME)
            return
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchOrders()
    }, [isAuthenticated, user, navigate, fetchOrders])

    const handleOpenDialog = async (order: Order) => {
        try {
            const response = await api.get(`/admin/orders/${order.id}`)
            setSelectedOrder(response.data)
            setOrderStatus(response.data.status)
            setPaymentStatus(response.data.payment_status)
            setShippingAddress(response.data.shipping_address || '')
            setTrackingNumber(response.data.tracking_number || '')
            setOpenDialog(true)
        } catch (error) {
            console.error('Error fetching order details', error)
            setError('Failed to load order details')
        }
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setSelectedOrder(null)
    }

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return
        try {
            await api.put(`/admin/orders/${selectedOrder.id}`, {
                status: orderStatus,
                payment_status: paymentStatus,
                shipping_address: shippingAddress,
                tracking_number: trackingNumber,
            })
            handleCloseDialog()
            fetchOrders()
        } catch (error) {
            console.error('Error updating order', error)
            setError('Failed to update order')
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<
            string,
            'success' | 'warning' | 'error' | 'info' | 'default'
        > = {
            pending: 'warning',
            processing: 'info',
            shipped: 'info',
            delivered: 'success',
            cancelled: 'error',
        }
        return colors[status] || 'default'
    }

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<
            string,
            'success' | 'warning' | 'error' | 'default'
        > = {
            paid: 'success',
            pending: 'warning',
            failed: 'error',
            refunded: 'default',
        }
        return colors[status] || 'default'
    }

    if (loading) {
        return (
            <Box>
                <ProfileHeader />
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Box
                        sx={{
                            width: 250,
                            borderRight: 1,
                            borderColor: 'divider',
                            flexShrink: 0,
                        }}
                    >
                        <AdminSidebar />
                    </Box>
                    <Box sx={{ flex: 1, p: 3 }}>
                        <Typography
                            variant="h4"
                            fontWeight="Bold"
                            sx={{ mb: 2 }}
                        >
                            Admin Dashboard - Orders
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: 400,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Box>
        )
    }

    return (
        <Box>
            <ProfileHeader />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Box
                    sx={{
                        width: 250,
                        borderRight: 1,
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <AdminSidebar />
                </Box>
                <Box sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h4" fontWeight="Bold" sx={{ mb: 3 }}>
                        Admin Dashboard - Orders
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order #</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Shipping Address</TableCell>
                                    <TableCell>Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Payment</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            {order.order_number}
                                        </TableCell>
                                        <TableCell>
                                            {order.user
                                                ? `${order.user.first_name} ${order.user.last_name}`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ maxWidth: 200 }}
                                            >
                                                {order.shipping_address || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            ${Number(order.total).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={getStatusColor(
                                                    order.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.payment_status}
                                                color={getPaymentStatusColor(
                                                    order.payment_status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDateTime(order.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleOpenDialog(order)
                                                }
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Order Details Dialog */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="lg"
                        fullWidth
                    >
                        <DialogTitle
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        Order #{selectedOrder?.order_number}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ opacity: 0.9, mt: 0.5 }}
                                    >
                                        {selectedOrder &&
                                            formatDateTime(
                                                selectedOrder.created_at
                                            )}
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={handleCloseDialog}
                                    size="small"
                                    sx={{ color: 'white' }}
                                >
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
                            {selectedOrder && (
                                <Stack spacing={3}>
                                    {/* Top Row - Customer and Payment Info */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Card elevation={2}>
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <Person
                                                            sx={{
                                                                mr: 1,
                                                                color: 'primary.main',
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                        >
                                                            Customer Details
                                                        </Typography>
                                                    </Box>
                                                    <Stack spacing={1}>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Name
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {selectedOrder.user
                                                                    ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}`
                                                                    : 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Email
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {selectedOrder
                                                                    .user
                                                                    ?.email ||
                                                                    'N/A'}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Phone
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {selectedOrder
                                                                    .user
                                                                    ?.phone ||
                                                                    'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Card elevation={2}>
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <Payment
                                                            sx={{
                                                                mr: 1,
                                                                color: 'primary.main',
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                        >
                                                            Payment Information
                                                        </Typography>
                                                    </Box>
                                                    <Stack spacing={1}>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Payment Method
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {selectedOrder.payment_method ||
                                                                    'N/A'}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Payment Status
                                                            </Typography>
                                                            <Box
                                                                sx={{ mt: 0.5 }}
                                                            >
                                                                <Chip
                                                                    label={
                                                                        selectedOrder.payment_status
                                                                    }
                                                                    color={getPaymentStatusColor(
                                                                        selectedOrder.payment_status
                                                                    )}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        </Box>
                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Order Status
                                                            </Typography>
                                                            <Box
                                                                sx={{ mt: 0.5 }}
                                                            >
                                                                <Chip
                                                                    label={
                                                                        selectedOrder.status
                                                                    }
                                                                    color={getStatusColor(
                                                                        selectedOrder.status
                                                                    )}
                                                                    size="small"
                                                                />
                                                            </Box>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>

                                    {/* Order Summary */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Receipt
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main',
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    Order Summary
                                                </Typography>
                                            </Box>
                                            <Box sx={{ maxWidth: 400 }}>
                                                <Stack spacing={1.5}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                        }}
                                                    >
                                                        <Typography variant="body1">
                                                            Subtotal
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            $
                                                            {Number(
                                                                selectedOrder.subtotal
                                                            ).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                        }}
                                                    >
                                                        <Typography variant="body1">
                                                            Tax
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            $
                                                            {Number(
                                                                selectedOrder.tax
                                                            ).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                        }}
                                                    >
                                                        <Typography variant="body1">
                                                            Discount
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            color="error"
                                                        >
                                                            -$
                                                            {Number(
                                                                selectedOrder.discount
                                                            ).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                    <Divider />
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                        >
                                                            Total
                                                        </Typography>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            color="primary"
                                                        >
                                                            $
                                                            {Number(
                                                                selectedOrder.total
                                                            ).toFixed(2)}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    {/* Status Update Section */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <CheckCircle
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main',
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    Update Order Status
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>
                                                            Order Status
                                                        </InputLabel>
                                                        <Select
                                                            value={orderStatus}
                                                            label="Order Status"
                                                            onChange={(e) =>
                                                                setOrderStatus(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="pending">
                                                                Pending
                                                            </MenuItem>
                                                            <MenuItem value="processing">
                                                                Processing
                                                            </MenuItem>
                                                            <MenuItem value="completed">
                                                                Completed
                                                            </MenuItem>
                                                            <MenuItem value="cancelled">
                                                                Cancelled
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>
                                                            Payment Status
                                                        </InputLabel>
                                                        <Select
                                                            value={
                                                                paymentStatus
                                                            }
                                                            label="Payment Status"
                                                            onChange={(e) =>
                                                                setPaymentStatus(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <MenuItem value="pending">
                                                                Pending
                                                            </MenuItem>
                                                            <MenuItem value="paid">
                                                                Paid
                                                            </MenuItem>
                                                            <MenuItem value="failed">
                                                                Failed
                                                            </MenuItem>
                                                            <MenuItem value="refunded">
                                                                Refunded
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {/* Shipping Information */}
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <LocalShipping
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main',
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    Shipping Information
                                                </Typography>
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Shipping Address"
                                                        value={shippingAddress}
                                                        onChange={(e) =>
                                                            setShippingAddress(
                                                                e.target.value
                                                            )
                                                        }
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        placeholder="Enter shipping address"
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        label="Tracking Number"
                                                        value={trackingNumber}
                                                        onChange={(e) =>
                                                            setTrackingNumber(
                                                                e.target.value
                                                            )
                                                        }
                                                        fullWidth
                                                        placeholder="Enter tracking number"
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Stack>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, bgcolor: 'grey.50' }}>
                            <Button onClick={handleCloseDialog} size="large">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateOrder}
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<CheckCircle />}
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    )
}
