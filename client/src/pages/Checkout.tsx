import { Box, Container, Typography } from '@mui/material';

interface CheckoutProps {
    searchQuery: string;
    mobileDrawerOpen: boolean;
    onDrawerClose: () => void;
}

function Checkout({
                      searchQuery: _searchQuery,
                      mobileDrawerOpen: _mobileDrawerOpen,
                      onDrawerClose: _onDrawerClose,
                  }: CheckoutProps) {
    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                minHeight: 'calc(100vh - 64px)',
                marginLeft: 0,
                display: 'flex',
            }}
        >
            <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: { xs: 2, md: 3 } }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Checkout
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Complete your purchase below.
                    </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Billing information placeholder.
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Payment method placeholder.
                </Typography>

                <Typography variant="body1" sx={{ mb: 2 }}>
                    Order summary placeholder.
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    This is a minimal checkout page for layout only.
                </Typography>
            </Container>
        </Box>
    );
}

export default Checkout;
