import { Grid, Card, CardMedia, CardContent, Typography, CardActions, Button, Box } from '@mui/material';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  platform?: string;
}

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={product.image_url || 'https://via.placeholder.com/300x200?text=Game+Key'}
              alt={product.title}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h6" component="div" noWrap>
                {product.title}
              </Typography>
              {product.platform && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Platform: {product.platform}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {product.description}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                ${product.price.toFixed(2)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" variant="contained" fullWidth>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default ProductGrid;
