import { Container, Typography, Box } from '@mui/material'

function App() {
  return (
    <Box>
      <Box sx={{ bgcolor: '#1976d2', color: 'white', py: 6, mb: 4 }}>
        <Container>
          <Typography variant="h2">Game Key Store</Typography>
          <Typography variant="h6">Group 5 Project</Typography>
        </Container>
      </Box>

      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>About Us</Typography>
        <Typography paragraph>Some plaece holder</Typography>

        <Typography variant="h5" sx={{ mt: 3 }}>Our Mission</Typography>
        <Typography paragraph>
          To provide gamers with a fast, secure, and reliable way to purchase and receive their favorite game keys.
        </Typography>

        <Typography variant="h5" sx={{ mt: 3 }}>What We Offer</Typography>
        <ul>
          <li>Instant key delivery</li>
          <li>Secure payment processing</li>
          <li>Wide game selection</li>
          <li>24/7 customer support</li>
        </ul>

        <Box sx={{ textAlign: 'center', py: 4, color: 'gray' }}>
          <Typography variant="body2">
            &copy; 2025 Game Key Store - Group 5
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default App
