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
    TextField,
    Button,
    Chip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader.tsx'
import AdminSidebar from '../components/AdminSidebar.tsx'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'
import { formatDateTime, formatDate } from '../utils/dateFormat'

interface DiscountCode {
    id: number
    code: string
    percent_off: number
    status: 'active' | 'used' | 'expired' | 'disabled'
    by: number
    created_at: string
    used_on?: string
    order_number?: string
    creator?: {
        id: number
        first_name: string
        last_name: string
        email: string
    }
}

export default function AdminDiscountCodes() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuthStore()
    const [codes, setCodes] = useState<DiscountCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
    const [formData, setFormData] = useState({
        code: '',
        percent_off: '',
        status: 'active' as 'active' | 'used' | 'expired' | 'disabled',
    })

    const fetchCodes = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/admin/discount-codes')
            setCodes(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching discount codes', error)
            setError('Failed to load discount codes')
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
        void fetchCodes()
    }, [isAuthenticated, user, navigate, fetchCodes])

    const handleOpenDialog = (code?: DiscountCode) => {
        if (code) {
            setEditingCode(code)
            setFormData({
                code: code.code,
                percent_off: code.percent_off.toString(),
                status: code.status,
            })
        } else {
            setEditingCode(null)
            setFormData({
                code: '',
                percent_off: '',
                status: 'active',
            })
        }
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setEditingCode(null)
    }

    const handleSubmit = async () => {
        try {
            if (editingCode) {
                await api.put(`/admin/discount-codes/${editingCode.id}`, {
                    status: formData.status,
                    percent_off: parseFloat(formData.percent_off),
                })
            } else {
                await api.post('/admin/discount-codes', {
                    code: formData.code.toUpperCase(),
                    percent_off: parseFloat(formData.percent_off),
                })
            }
            handleCloseDialog()
            fetchCodes()
        } catch (error) {
            console.error('Error saving discount code', error)
            setError('Failed to save discount code')
        }
    }

    const handleDelete = async (codeId: number) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this discount code?'
            )
        )
            return
        try {
            await api.delete(`/admin/discount-codes/${codeId}`)
            fetchCodes()
        } catch (error) {
            console.error('Error deleting discount code', error)
            setError('Failed to delete discount code')
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const getStatusColor = (status: string) => {
        const colors: Record<
            string,
            'success' | 'warning' | 'error' | 'default'
        > = {
            active: 'success',
            used: 'default',
            expired: 'warning',
            disabled: 'error',
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
                            Admin Dashboard - Discount Codes
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
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                        }}
                    >
                        <Typography variant="h4" fontWeight="Bold">
                            Admin Dashboard - Discount Codes
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Code
                        </Button>
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

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Code</TableCell>
                                    <TableCell>Discount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created By</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Used On</TableCell>
                                    <TableCell>Order #</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {codes.map((code) => (
                                    <TableRow key={code.id}>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight="bold"
                                                fontFamily="monospace"
                                            >
                                                {code.code}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {code.percent_off}%
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={code.status}
                                                color={getStatusColor(
                                                    code.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {code.creator
                                                ? `${code.creator.first_name} ${code.creator.last_name}`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(code.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            {code.used_on
                                                ? formatDateTime(code.used_on)
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {code.order_number || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleOpenDialog(code)
                                                }
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(code.id)
                                                }
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add/Edit Dialog */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>
                            {editingCode
                                ? 'Edit Discount Code'
                                : 'Add Discount Code'}
                        </DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                {!editingCode && (
                                    <TextField
                                        label="Code"
                                        value={formData.code}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'code',
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                        fullWidth
                                        required
                                        placeholder="SUMMER20"
                                        helperText="Code will be automatically converted to uppercase"
                                    />
                                )}

                                <TextField
                                    label="Discount Percentage"
                                    type="number"
                                    value={formData.percent_off}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'percent_off',
                                            e.target.value
                                        )
                                    }
                                    fullWidth
                                    required
                                    disabled={!!editingCode}
                                    inputProps={{
                                        min: 0,
                                        max: 100,
                                        step: 0.01,
                                    }}
                                    helperText={
                                        editingCode
                                            ? 'Discount percentage cannot be changed'
                                            : 'Enter a value between 0 and 100'
                                    }
                                />

                                {editingCode && (
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={formData.status}
                                            label="Status"
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'status',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <MenuItem value="active">
                                                Active
                                            </MenuItem>
                                            <MenuItem value="disabled">
                                                Disabled
                                            </MenuItem>
                                            <MenuItem value="expired">
                                                Expired
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                variant="contained"
                                disabled={
                                    !formData.code.trim() ||
                                    !formData.percent_off
                                }
                            >
                                {editingCode ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    )
}
