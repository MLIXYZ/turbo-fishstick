import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ROUTES from './config/routes'
import Profile from './pages/profile'
import Admin from './pages/admin'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminUsers from './pages/AdminUsers'
import AdminDiscountCodes from './pages/AdminDiscountCodes'
import Cart from './pages/Cart.tsx'
import Checkout from './pages/Checkout.tsx'

function App() {
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    // TODO: Implement dynamic cart state management
    const [cartItemCount] = useState<number>(0)

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    const handleMenuClick = () => {
        setMobileDrawerOpen(true)
    }

    const handleDrawerClose = () => {
        setMobileDrawerOpen(false)
    }

    return (
        <Router>
            <Routes>
                <Route
                    path={ROUTES.HOME}
                    element={
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '100vh',
                                bgcolor: 'grey.100',
                            }}
                        >
                            <Header
                                onSearch={handleSearch}
                                onMenuClick={handleMenuClick}
                                cartItemCount={cartItemCount}
                            />

                            <Home
                                searchQuery={searchQuery}
                                mobileDrawerOpen={mobileDrawerOpen}
                                onDrawerClose={handleDrawerClose}
                            />

                            <Box
                                component="footer"
                                sx={{
                                    bgcolor: 'grey.900',
                                    color: 'white',
                                    py: { xs: 3, md: 4 },
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    marginLeft: { xs: 0, md: '260px' },
                                }}
                            >
                                <Container maxWidth="xl">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            gutterBottom
                                        >
                                            🎮 Game Key Store
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="grey.400"
                                        >
                                            &copy; 2025 Game Key Store - Group
                                            5. All rights reserved.
                                        </Typography>
                                    </Box>
                                </Container>
                            </Box>
                        </Box>
                    }
                />
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.SIGNUP} element={<SignUp />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.ADMIN} element={<Admin />} />
                <Route
                    path={ROUTES.ADMIN_PRODUCTS}
                    element={<AdminProducts />}
                />
                <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrders />} />
                <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
                <Route
                    path={ROUTES.ADMIN_DISCOUNT_CODES}
                    element={<AdminDiscountCodes />}
                />
            </Routes>
        </Router>
    )
}

export default App
