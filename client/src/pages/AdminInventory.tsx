import { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    IconButton,
    Stack,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material/Select'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ProfileHeader from '../components/ProfileHeader'
import AdminSidebar from '../components/AdminSidebar'
import ROUTES from '../config/routes'

const API_URL = import.meta.env.VITE_API_URL

interface StockKey {
    id: number
    product_id: number
    game_key: string
    status: 'available' | 'sold' | 'reserved'
    order_id: number | null
    order_number: string | null
    created_at: string
    assigned_at: string | null
    notes: string | null
    product?: {
        id: number
        title: string
        image_url?: string
    }
    order?: {
        id: number
        order_number: string
        billing_email: string
    }
}

interface Product {
    id: number
    title: string
}

function AdminInventory() {
    const [keys, setKeys] = useState<StockKey[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterProduct, setFilterProduct] = useState<string>('all')

    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedKey, setSelectedKey] = useState<StockKey | null>(null)

    const [newKey, setNewKey] = useState({
        product_id: '',
        game_key: '',
        notes: '',
    })

    const [assignData, setAssignData] = useState({
        order_number: '',
    })

    const navigate = useNavigate()
    const { user, token } = useAuthStore()

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate(ROUTES.LOGIN)
            return
        }
        fetchKeys()
        fetchProducts()
    }, [user, navigate])

    const fetchKeys = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${API_URL}/admin/stock-keys`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setKeys(res.data)
        } catch (err) {
            console.error('Error fetching keys:', err)
            setError('Failed to fetch stock keys')
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/products`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setProducts(res.data)
        } catch (err) {
            console.error('Error fetching products:', err)
        }
    }

    const handleAddKey = async () => {
        try {
            setError(null)
            await axios.post(`${API_URL}/admin/stock-keys`, newKey, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setSuccess('Stock key added successfully')
            setAddDialogOpen(false)
            setNewKey({ product_id: '', game_key: '', notes: '' })
            fetchKeys()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to add stock key')
        }
    }

    const handleDeleteKey = async (id: number) => {
        if (!confirm('Are you sure you want to delete this key?')) return

        try {
            setError(null)
            await axios.delete(`${API_URL}/admin/stock-keys/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setSuccess('Stock key deleted successfully')
            fetchKeys()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete stock key')
        }
    }

    const handleAssignKey = async () => {
        if (!selectedKey) return

        try {
            setError(null)
            await axios.put(
                `${API_URL}/admin/stock-keys/${selectedKey.id}/assign`,
                assignData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            setSuccess('Stock key assigned successfully')
            setAssignDialogOpen(false)
            setAssignData({ order_number: '' })
            setSelectedKey(null)
            fetchKeys()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to assign stock key')
        }
    }

    const filteredKeys = keys.filter((key) => {
        if (filterStatus !== 'all' && key.status !== filterStatus) return false
        if (filterProduct !== 'all' && String(key.product_id) !== filterProduct)
            return false
        return true
    })

    const getStatusColor = (
        status: string
    ): 'success' | 'error' | 'warning' => {
        switch (status) {
            case 'available':
                return 'success'
            case 'sold':
                return 'error'
            case 'reserved':
                return 'warning'
            default:
                return 'success'
        }
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
                    <Box
                        sx={{
                            flex: 1,
                            p: 3,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Typography>Loading...</Typography>
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
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Admin Dashboard - Stock Keys
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage game keys and assign them to orders
                        </Typography>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert
                            severity="success"
                            sx={{ mb: 2 }}
                            onClose={() => setSuccess(null)}
                        >
                            {success}
                        </Alert>
                    )}

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                        >
                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Filter by Status</InputLabel>
                                <Select
                                    value={filterStatus}
                                    label="Filter by Status"
                                    onChange={(e: SelectChangeEvent) =>
                                        setFilterStatus(e.target.value)
                                    }
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="available">
                                        Available
                                    </MenuItem>
                                    <MenuItem value="sold">Sold</MenuItem>
                                    <MenuItem value="reserved">
                                        Reserved
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Filter by Product</InputLabel>
                                <Select
                                    value={filterProduct}
                                    label="Filter by Product"
                                    onChange={(e: SelectChangeEvent) =>
                                        setFilterProduct(e.target.value)
                                    }
                                >
                                    <MenuItem value="all">
                                        All Products
                                    </MenuItem>
                                    {products.map((product) => (
                                        <MenuItem
                                            key={product.id}
                                            value={String(product.id)}
                                        >
                                            {product.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Box sx={{ flexGrow: 1 }} />

                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setAddDialogOpen(true)}
                            >
                                Add Key
                            </Button>
                        </Stack>
                    </Paper>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Game Key</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Order</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredKeys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.id}</TableCell>
                                        <TableCell>
                                            {key.product?.title ||
                                                `Product #${key.product_id}`}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.9rem',
                                                }}
                                            >
                                                {key.game_key}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={key.status}
                                                color={getStatusColor(
                                                    key.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {key.order_number ? (
                                                <Typography variant="body2">
                                                    {key.order_number}
                                                </Typography>
                                            ) : (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Not assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                key.created_at
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                {key.status === 'available' && (
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedKey(key)
                                                            setAssignDialogOpen(
                                                                true
                                                            )
                                                        }}
                                                    >
                                                        <AssignmentIcon />
                                                    </IconButton>
                                                )}
                                                {key.status !== 'sold' && (
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            handleDeleteKey(
                                                                key.id
                                                            )
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add Key Dialog */}
                    <Dialog
                        open={addDialogOpen}
                        onClose={() => setAddDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Add Stock Key</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Product</InputLabel>
                                <Select
                                    value={newKey.product_id}
                                    label="Product"
                                    onChange={(e: SelectChangeEvent) =>
                                        setNewKey({
                                            ...newKey,
                                            product_id: e.target.value,
                                        })
                                    }
                                >
                                    {products.map((product) => (
                                        <MenuItem
                                            key={product.id}
                                            value={String(product.id)}
                                        >
                                            {product.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Game Key"
                                value={newKey.game_key}
                                onChange={(e) =>
                                    setNewKey({
                                        ...newKey,
                                        game_key: e.target.value,
                                    })
                                }
                                placeholder="XXXX-YYYY-ZZZZ-AAAA"
                            />

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Notes (optional)"
                                value={newKey.notes}
                                onChange={(e) =>
                                    setNewKey({
                                        ...newKey,
                                        notes: e.target.value,
                                    })
                                }
                                multiline
                                rows={2}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAddKey}
                                disabled={
                                    !newKey.product_id || !newKey.game_key
                                }
                            >
                                Add Key
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Assign Key Dialog */}
                    <Dialog
                        open={assignDialogOpen}
                        onClose={() => setAssignDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Assign Key to Order</DialogTitle>
                        <DialogContent>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Key: <strong>{selectedKey?.game_key}</strong>
                            </Typography>

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Order Number"
                                value={assignData.order_number}
                                onChange={(e) =>
                                    setAssignData({
                                        order_number: e.target.value,
                                    })
                                }
                                placeholder="GK-1234567890-123"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAssignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleAssignKey}
                                disabled={!assignData.order_number}
                            >
                                Assign
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    )
}

export default AdminInventory
