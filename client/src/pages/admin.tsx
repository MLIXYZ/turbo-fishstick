import { useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader.tsx'
import AdminSidebar from '../components/AdminSidebar.tsx'
import { useAuthStore } from '../store/authStore'
import ROUTES from '../config/routes'

export default function Admin() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuthStore()

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (!isAuthenticated || !user) {
            navigate(ROUTES.LOGIN)
            return
        }
        if (user.role !== 'admin') {
            navigate(ROUTES.HOME)
            return
        }
    }, [isAuthenticated, user, navigate])

    return (
        <Box>
            <ProfileHeader />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                {/* sidebar */}
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
                {/* main */}
                <Box sx={{ flex: 1, p: 3 }}>
                    <Typography variant="h4" fontWeight="Bold">
                        Admin Dashboard
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}
