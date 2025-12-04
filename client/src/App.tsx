import { useState, useEffect } from 'react';
import { Box, Container, Grid, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import Header from './components/Header';
import CategorySidebar from './components/CategorySidebar';
import ProductGrid from './components/ProductGrid';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  platform?: string;
}

const API_URL = 'http://localhost:3000/api';

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.append('category', selectedCategory.toString());
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await axios.get(`${API_URL}/products?${params.toString()}`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onSearch={handleSearch} />

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="error">
                  {error}
                </Typography>
              </Box>
            ) : (
              <ProductGrid products={products} />
            )}
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'grey.200', py: 3, mt: 'auto' }}>
        <Container>
          <Typography variant="body2" align="center" color="text.secondary">
            &copy; 2025 Game Key Store - Group 5
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
