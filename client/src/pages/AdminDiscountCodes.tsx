import {
    Box,
    Typography
} from "@mui/material";
import ProfileHeader from "../components/ProfileHeader.tsx";
import AdminSidebar from "../components/AdminSidebar.tsx";

// TODO: authentication somehow

export default function Admin() {
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
                    <Typography variant="h4" fontWeight="Bold" sx={{ mb: 2 }}>Admin Dashboard - Discount Codes</Typography>
                </Box>
            </Box>
        </Box>
    )
}