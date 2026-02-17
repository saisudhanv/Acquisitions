# Acquisitions API - Dockerized with Neon Database

This project is configured to work with Neon Database in both development and production environments using Docker.

## Architecture Overview

- **Development**: Uses Neon Local proxy for local development with ephemeral database branches
- **Production**: Connects directly to Neon Cloud Database
- **Docker**: Multi-stage builds with environment-specific configurations

## Prerequisites

- Docker and Docker Compose
- Neon account with API key
- Node.js application (for local development without Docker)

## Getting Your Neon Credentials

1. Go to [Neon Console](https://console.neon.tech)
2. Create a project or select an existing one
3. Get your **API Key** from Account Settings → API Keys
4. Get your **Project ID** from Project Settings → General
5. Note your database connection string for production

## Development Setup

### Quick Start (Windows PowerShell)

```powershell
# Run the setup script
.\scripts\setup-dev.ps1
```

### Quick Start (Unix/Linux/Mac)

```bash
# Make the script executable and run it
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### Manual Setup

1. **Configure Environment Variables**

   Update `.env.development` with your Neon credentials:

   ```env
   NEON_API_KEY=your_actual_api_key_here
   NEON_PROJECT_ID=your_actual_project_id_here
   ```

2. **Start Development Environment**

   ```bash
   docker-compose -f docker-compose.dev.yml --env-file .env.development up --build
   ```

3. **Access Your Application**
   - Application: http://localhost:3000
   - Neon Local Proxy: localhost:5432

### How Development Works

- **Neon Local Container**: Acts as a proxy to your Neon cloud database
- **Ephemeral Branches**: Each container start creates a new database branch, deleted on stop
- **Git Integration**: Optionally creates persistent branches per Git branch
- **Hot Reload**: Source code changes are reflected immediately

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml --env-file .env.development up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild containers
docker-compose -f docker-compose.dev.yml up --build

# Connect to database directly
psql postgres://neon:npg@localhost:5432/acquisitions_db
```

## Production Deployment

### Environment Configuration

1. **Update Production Environment**

   Update `.env.production` with your production values:

   ```env
   DATABASE_URL=postgres://username:password@ep-something.us-east-1.aws.neon.tech/dbname?sslmode=require
   API_BASE_URL=https://your-production-domain.com
   ```

2. **Deploy with Docker Compose**

   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

### Cloud Deployment (AWS, GCP, Azure)

#### Using Environment Variables

Set these environment variables in your cloud platform:

```bash
DATABASE_URL=postgres://username:password@ep-something.us-east-1.aws.neon.tech/dbname?sslmode=require
NODE_ENV=production
API_BASE_URL=https://your-domain.com
```

#### Docker Deployment Command

```bash
docker run -d \
  --name acquisitions-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="$DATABASE_URL" \
  -e API_BASE_URL="$API_BASE_URL" \
  your-registry/acquisitions-api:latest
```

## Database Drivers

This setup supports both database drivers simultaneously:

### Standard Postgres Driver (pg)

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // for development with Neon Local
});
```

### Neon Serverless Driver

```javascript
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

// Configuration is handled automatically in config/database.js
const result = await sql`SELECT * FROM users`;
```

## File Structure

```
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.dev.yml     # Development with Neon Local
├── docker-compose.prod.yml    # Production deployment
├── .env.development           # Development environment variables
├── .env.production           # Production environment variables
├── config/
│   └── database.js           # Database configuration for both drivers
├── scripts/
│   ├── setup-dev.sh          # Unix development setup script
│   └── setup-dev.ps1         # Windows development setup script
└── README-Docker-Neon.md     # This file
```

## Troubleshooting

### Development Issues

**Neon Local not connecting:**

- Verify your `NEON_API_KEY` and `NEON_PROJECT_ID` are correct
- Check that the neon-local container is healthy: `docker-compose -f docker-compose.dev.yml ps`

**SSL Certificate errors:**

- For JavaScript apps, ensure `ssl: { rejectUnauthorized: false }` is set in development

**Git branch integration not working:**

- Ensure Docker Desktop for Mac uses gRPC FUSE instead of VirtioFS
- Check that `.git/HEAD` is properly mounted

### Production Issues

**Database connection failures:**

- Verify your production `DATABASE_URL` is correct
- Ensure your production environment has the proper SSL configuration
- Check that your Neon database allows connections from your deployment platform

**Environment variable issues:**

- Ensure all required environment variables are set in your deployment platform
- Verify that sensitive values are not logged or exposed

## Environment Variables Reference

### Development

- `NEON_API_KEY`: Your Neon API key
- `NEON_PROJECT_ID`: Your Neon project ID
- `PARENT_BRANCH_ID`: Parent branch for ephemeral branches (optional, defaults to main)
- `DATABASE_URL`: Auto-configured to use Neon Local proxy

### Production

- `DATABASE_URL`: Your Neon cloud database connection string
- `NODE_ENV`: Set to "production"
- `API_BASE_URL`: Your production domain
- `PORT`: Application port (default: 3000)

## Security Best Practices

1. **Never commit environment files** with real credentials
2. **Use secrets management** in production (AWS Secrets Manager, etc.)
3. **Enable SSL** in production
4. **Restrict database access** using Neon's IP allowlists in production
5. **Regularly rotate** API keys and database passwords

## Support

- [Neon Documentation](https://neon.com/docs)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Contributing

1. Use the development environment for all changes
2. Test both database drivers if making database-related changes
3. Update documentation for any configuration changes
4. Ensure production deployment still works after changes
