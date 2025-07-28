# Production Deployment Guide

This guide will help you deploy the Automation Database system to production.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM and 10GB disk space
- (Optional) Domain name pointing to your server

### 1. Clone and Setup
```bash
git clone https://github.com/issaczerubbabela/db-django.git
cd db-django
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your production values
nano .env
```

**Important**: Change these values in `.env`:
- `SECRET_KEY`: Generate a secure secret key
- `DB_PASSWORD`: Set a strong database password
- `DOMAIN_NAME`: Your production domain name

### 3. Run Setup (Choose your platform)

**Windows:**
```cmd
setup-production.bat
```

**Linux/Mac:**
```bash
chmod +x setup-production.sh
./setup-production.sh
```

### 4. Deploy

**Windows:**
```cmd
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. Access Your Application
- **Main Application**: http://localhost (or your domain)
- **Django Admin**: http://localhost/admin/
- **API Documentation**: http://localhost/fastapi/docs

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Django secret key | - | ✅ |
| `DEBUG` | Debug mode | False | ❌ |
| `DOMAIN_NAME` | Your domain name | localhost | ❌ |
| `DB_PASSWORD` | Database password | postgres123 | ✅ |
| `FRONTEND_URL` | Frontend URL | http://localhost:3000 | ❌ |

### Database Configuration
The system uses PostgreSQL by default in production. If you prefer SQLite, leave `DB_PASSWORD` empty.

### HTTPS Configuration
To enable HTTPS:
1. Place your SSL certificate files in the `ssl/` directory
2. Update `nginx/conf.d/default.conf` to uncomment SSL sections
3. Set these environment variables:
   ```
   SECURE_SSL_REDIRECT=True
   SESSION_COOKIE_SECURE=True
   CSRF_COOKIE_SECURE=True
   ```

## 📊 Monitoring and Maintenance

### View Logs
```bash
docker-compose logs -f
```

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres automation_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U postgres automation_db < backup.sql
```

### Update Application
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

## 🛠️ Troubleshooting

### Common Issues

**Container won't start**
```bash
docker-compose logs [service-name]
```

**Database connection error**
- Check if PostgreSQL container is running
- Verify database credentials in `.env`

**Static files not loading**
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

**Permission denied errors**
```bash
# On Linux/Mac, fix permissions
sudo chown -R $USER:$USER .
```

### Performance Tuning

For high-traffic deployments:
1. Increase worker processes in `docker-compose.yml`
2. Add Redis for caching
3. Use external PostgreSQL service
4. Configure CDN for static assets

## 🔒 Security Checklist

- [ ] Change default `SECRET_KEY`
- [ ] Set strong `DB_PASSWORD`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Enable HTTPS in production
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Regular database backups

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx, AWS ALB, etc.)
- Multiple backend instances
- External database service
- Redis for session storage

### Vertical Scaling
- Monitor resource usage
- Increase container resources
- Optimize database queries
- Use caching strategies

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Review this guide
3. Check the main README.md for development setup
4. Open an issue on GitHub

## 📝 License

This project is licensed under the MIT License.
