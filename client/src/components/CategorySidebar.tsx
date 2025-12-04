import { List, ListItem, ListItemButton, ListItemText, Paper, Typography, Box } from '@mui/material';

interface Category {
  id: number;
  name: string;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

function CategorySidebar({ categories, selectedCategory, onCategorySelect }: CategorySidebarProps) {
  return (
    <Paper elevation={2} sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Categories</Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedCategory === null}
            onClick={() => onCategorySelect(null)}
          >
            <ListItemText primary="All Games" />
          </ListItemButton>
        </ListItem>
        {categories.map((category) => (
          <ListItem key={category.id} disablePadding>
            <ListItemButton
              selected={selectedCategory === category.id}
              onClick={() => onCategorySelect(category.id)}
            >
              <ListItemText primary={category.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default CategorySidebar;
