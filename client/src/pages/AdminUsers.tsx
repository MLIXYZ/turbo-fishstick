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
    FormControlLabel,
    Switch,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader.tsx'
import AdminSidebar from '../components/AdminSidebar.tsx'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'

interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    username: string
    phone: string | null
    role: 'customer' | 'admin'
    is_verified: boolean
    is_active: boolean
    created_at: string
    last_login: string | null
}

export default function AdminUsers() {
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated } = useAuthStore()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        phone: '',
        role: 'customer' as 'customer' | 'admin',
        is_active: true,
        is_verified: false,
    })

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/admin/users')
            setUsers(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching users', error)
            setError('Failed to load users')
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (!isAuthenticated || !currentUser) {
            navigate(ROUTES.LOGIN)
            return
        }
        if (currentUser.role !== 'admin') {
            navigate(ROUTES.HOME)
            return
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchUsers()
    }, [isAuthenticated, currentUser, navigate, fetchUsers])

    const handleOpenDialog = (user: User) => {
        setEditingUser(user)
        setFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            username: user.username,
            phone: user.phone || '',
            role: user.role,
            is_active: user.is_active,
            is_verified: user.is_verified,
        })
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setEditingUser(null)
    }

    const handleSubmit = async () => {
        if (!editingUser) return
        try {
            await api.put(`/admin/users/${editingUser.id}`, formData)
            handleCloseDialog()
            fetchUsers()
        } catch (error) {
            console.error('Error updating user', error)
            setError('Failed to update user')
        }
    }

    const handleDelete = async (userId: number) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this user? This action cannot be undone.'
            )
        )
            return
        try {
            await api.delete(`/admin/users/${userId}`)
            fetchUsers()
        } catch (error: unknown) {
            console.error('Error deleting user', error)
            const errorMessage =
                (error as { response?: { data?: { error?: string } } })
                    ?.response?.data?.error || 'Failed to delete user'
            setError(errorMessage)
        }
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
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
                            Admin Dashboard - Users
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
                            Admin Dashboard - Users
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

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Verified</TableCell>
                                    <TableCell>Joined</TableCell>
                                    <TableCell>Last Login</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>
                                            {user.first_name} {user.last_name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={
                                                    user.role === 'admin'
                                                        ? 'primary'
                                                        : 'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    user.is_active
                                                        ? 'Active'
                                                        : 'Disabled'
                                                }
                                                color={
                                                    user.is_active
                                                        ? 'success'
                                                        : 'error'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    user.is_verified
                                                        ? 'Verified'
                                                        : 'Unverified'
                                                }
                                                color={
                                                    user.is_verified
                                                        ? 'info'
                                                        : 'default'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.last_login)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() =>
                                                    handleOpenDialog(user)
                                                }
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                disabled={
                                                    user.id === currentUser?.id
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

                    {/* Edit user dialog */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="md"
                        fullWidth
                    >
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    mt: 2,
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="First Name"
                                        value={formData.first_name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'first_name',
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Last Name"
                                        value={formData.last_name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'last_name',
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    fullWidth
                                    required
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Username"
                                        value={formData.username}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'username',
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Phone"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'phone',
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                    />
                                </Box>
                                <FormControl fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={formData.role}
                                        label="Role"
                                        onChange={(e) =>
                                            handleInputChange(
                                                'role',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <MenuItem value="customer">
                                            Customer
                                        </MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </Select>
                                </FormControl>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.is_active}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'is_active',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Active Account"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.is_verified}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        'is_verified',
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        }
                                        label="Verified Email"
                                    />
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained">
                                Update
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    )
}
