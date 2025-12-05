import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  // TODO: Implement dynamic cart state management
  const [cartItemCount] = useState<number>(0);

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

  const handleMenuClick = () => {
    setMobileDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <Header
        onSearch={handleSearch}
        onMenuClick={handleMenuClick}
        cartItemCount={cartItemCount}
      />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isMobile && (
          <Box
            sx={{
              width: 260,
              flexShrink: 0,
              position: 'fixed',
              left: 0,
              top: 64,
              bottom: 0,
              overflowY: 'auto',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              zIndex: 100
            }}
          >
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </Box>
        )}

        {isMobile && (
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            mobileOpen={mobileDrawerOpen}
            onMobileClose={handleDrawerClose}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            marginLeft: { xs: 0, md: '260px' },
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: { xs: 2, md: 3 } }}>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name || 'Games'
                  : 'All Games'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {products.length} {products.length === 1 ? 'game' : 'games'} available
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: 400 }}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: 400 }}>
                <Typography variant="h6" color="error">
                  {error}
                </Typography>
              </Box>
            ) : (
              <ProductGrid products={products} />
            )}
          </Container>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: { xs: 3, md: 4 },
          borderTop: 1,
          borderColor: 'divider',
          marginLeft: { xs: 0, md: '260px' }
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🎮 Game Key Store
            </Typography>
            <Typography variant="body2" color="grey.400">
              &copy; 2025 Game Key Store - Group 5. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
