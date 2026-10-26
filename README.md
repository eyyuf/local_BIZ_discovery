# Local Business Discovery Platform

## Repository Structure

```text
local_BIZ_discovery/
├── backend/        # Laravel Modular Backend API
│   ├── app/        # Application modules (Identity, Place)
│   ├── config/     # Configuration files
│   ├── database/   # Migrations and seeders
│   ├── routes/     # Route definitions
│   └── artisan     # Laravel CLI entrypoint
├── frontend/       # Frontend Application
└── README.md       # Project documentation
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Composer dependencies:
   ```bash
   composer install
   ```

3. Set up the environment file:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Run database migrations:
   ```bash
   php artisan migrate
   ```

5. Run test suite:
   ```bash
   php artisan test
   ```

6. Start local development server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

The `frontend/` directory is designated for the client application. Commands and setup will be maintained inside `frontend/`.
