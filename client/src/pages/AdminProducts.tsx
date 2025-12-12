import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Paper,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    IconButton
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import ProfileHeader from "../components/ProfileHeader.tsx";
import AdminSidebar from "../components/AdminSidebar.tsx";
import axios from "axios";

// TODO: authentication somehow?

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    category_id: number;
    platform: string;
    image_url: string;
    stock: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const API_URL = 'http://localhost:3000/api';

export default function Admin() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        platform: '',
        image_url: '',
        stock: '',
        is_active: true
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/products`);
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products', error);
            setError('Failed to load products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                title: product.title,
                description: product.description,
                price: product.price.toString(),
                category_id: product.category_id.toString(),
                platform: product.platform,
                image_url: product.image_url,
                stock: product.stock.toString(),
                is_active: product.is_active
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: '',
                description: '',
                price: '',
                category_id: '',
                platform: '',
                image_url: '',
                stock: '',
                is_active: true
            });
        }
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProduct(null);
    };
    const handleSubmit = async () => {
        try {
            if (editingProduct) {
                // update existing product
                await axios.put(`${API_URL}/admin/products/${editingProduct.id}`, {
                    ...formData,
                    price: parseFloat(formData.price),
                    category_id: parseInt(formData.category_id),
                    stock: parseInt(formData.stock)
                });
            } else {
                // create new product
                await axios.post(`${API_URL}/admin/products`, {
                    ...formData,
                    price: parseFloat(formData.price),
                    category_id: parseInt(formData.category_id),
                    stock: parseInt(formData.stock)
                });
            }
            handleCloseDialog();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product', error);
            setError('Failed to save product');
        }
    };
    const handleDelete = async (productId: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${API_URL}/admin/products/${productId}`);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product', error);
            setError('Failed to delete product');
        }
    };
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Box>
                <ProfileHeader />
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    {/* sidebar */}
                    <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', flexShrink: 0 }}>
                        <AdminSidebar />
                    </Box>
                    {/* main */}
                    <Box sx={{ flex: 1, p: 3 }}>
                        <Typography variant="h4" fontWeight="Bold" sx={{ mb: 2 }}>Admin Dashboard - Products</Typography>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            <ProfileHeader />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* sidebar */}
                <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider' }}>
                    <AdminSidebar />
                </Box>
                {/* main */}
                <Box sx={{ flex: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4" fontWeight="Bold">Admin Dashboard - Products</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Product
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Platform</TableCell>
                                    <TableCell>Stock</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.title}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.category_id}</TableCell>
                                        <TableCell>{product.platform}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={product.is_active ? 'Active' : 'Inactive'}
                                                color={product.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(product)}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* add/edit dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                        <DialogTitle>
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <TextField
                                    label="Title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    multiline
                                    rows={3}
                                    fullWidth
                                    required
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Category"
                                        type="number"
                                        value={formData.category_id}
                                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => handleInputChange('stock', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Platform"
                                        value={formData.platform}
                                        onChange={(e) => handleInputChange('platform', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="Image URL"
                                        value={formData.image_url}
                                        onChange={(e) => handleInputChange('image_url', e.target.value)}
                                        fullWidth
                                        required
                                    />
                                </Box>
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleSubmit} variant="contained">
                                {editingProduct ? 'Update' : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Box>
    )
}