### Models

## Category
- `id` (INTEGER, Primary Key, Auto Increment)
- `name` (STRING, 100 chars, Unique, Not Null)
- `description` (TEXT)
- `created_at` (DATE)
- `updated_at` (DATE)

## Product
- `id` (INTEGER, Primary Key, Auto Increment)
- `title` (STRING, 255 chars, Not Null)
- `description` (TEXT)
- `price` (DECIMAL, 10,2, Not Null)
- `category_id` (INTEGER, Foreign Key -> categories.id)
- `platform` (STRING, 50 chars)
- `image_url` (STRING, 500 chars)
- `stock` (INTEGER, Default: 0)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (DATE)
- `updated_at` (DATE)

### Relationships
- **Product** belongs to **Category** (one-to-many)
- **Category** has many **Products**

Create a `.env` file in the server directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_key_store
DB_PORT=3306
PORT=3000
NODE_ENV=development
```