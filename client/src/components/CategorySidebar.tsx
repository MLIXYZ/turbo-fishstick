import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box,
    Drawer,
    useMediaQuery,
    useTheme,
} from '@mui/material'

interface Category {
    id: number
    name: string
}

interface CategorySidebarProps {
    categories: Category[]
    selectedCategory: number | null
    onCategorySelect: (categoryId: number | null) => void
    mobileOpen?: boolean
    onMobileClose?: () => void
}

function CategorySidebar({
    categories,
    selectedCategory,
    onCategorySelect,
    mobileOpen = false,
    onMobileClose,
}: CategorySidebarProps): JSX.Element {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const handleCategoryClick = (categoryId: number | null) => {
        onCategorySelect(categoryId)
        if (isMobile && onMobileClose) {
            onMobileClose()
        }
    }

    const sidebarContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
            }}
        >
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    Categories
                </Typography>
            </Box>
            <List sx={{ py: 2, px: 2, flex: 1, overflowY: 'auto' }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                        selected={selectedCategory === null}
                        onClick={() => handleCategoryClick(null)}
                        sx={{
                            borderRadius: 1,
                            borderLeft: selectedCategory === null ? 4 : 0,
                            borderLeftColor: 'primary.main',
                        }}
                    >
                        <ListItemText primary="All Games" />
                    </ListItemButton>
                </ListItem>
                {categories.map((category) => (
                    <ListItem key={category.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={selectedCategory === category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            sx={{
                                borderRadius: 1,
                                borderLeft:
                                    selectedCategory === category.id ? 4 : 0,
                                borderLeftColor: 'primary.main',
                            }}
                        >
                            <ListItemText primary={category.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    )

    if (isMobile) {
        return (
            <Drawer
                anchor="left"
                open={mobileOpen}
                onClose={onMobileClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {sidebarContent}
            </Drawer>
        )
    }

    return sidebarContent
}

export default CategorySidebar
