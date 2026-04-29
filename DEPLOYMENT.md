# TubeGrow Deployment Guide

This guide will help you deploy the TubeGrow application to production using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- MongoDB (if not using Docker)
- Node.js 18+ (for local development)
- YouTube Data API key
- Stripe and/or Razorpay account (for payments)
- Domain name (for production)

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/tubegrow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# YouTube API
YOUTUBE_API_KEY=your-youtube-data-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Configuration
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=https://yourdomain.com/api
```

## Quick Start with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd tubegrow
```

2. Update environment variables in `docker-compose.yml`

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## Manual Deployment

### Backend Deployment

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install --production
```

3. Create and configure `.env` file

4. Start the application:
```bash
npm start
```

### Frontend Deployment

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure `.env` file

4. Build the application:
```bash
npm run build
```

5. Serve with a web server (nginx, apache, etc.)

## Production Deployment Options

### Option 1: Docker Compose (Recommended)

Use the provided `docker-compose.yml` for easy deployment with all services.

### Option 2: Cloud Platforms

#### Heroku
1. Create a `Procfile` in the backend:
```
web: npm start
```

2. Deploy to Heroku:
```bash
heroku create tubegrow-api
git push heroku main
```

#### Vercel (Frontend)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy frontend:
```bash
cd frontend
vercel --prod
```

#### AWS ECS
1. Build and push Docker images to ECR
2. Create ECS task definitions
3. Deploy using ECS service

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

### Option 3: Traditional VPS

1. Set up a VPS (Ubuntu 20.04+ recommended)
2. Install Docker and Docker Compose
3. Follow Docker Compose deployment steps
4. Set up nginx reverse proxy
5. Configure SSL certificate (Let's Encrypt)

## SSL/HTTPS Setup

### Using Nginx

1. Install certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

3. Auto-renewal:
```bash
sudo crontab -e
```
Add:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in environment variables

### Self-hosted MongoDB

1. Install MongoDB:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

2. Start and enable MongoDB:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Monitoring and Logging

### Application Monitoring

1. Set up health checks in Docker Compose
2. Use application monitoring tools (New Relic, DataDog)
3. Set up alerting for errors and downtime

### Log Management

1. Configure centralized logging
2. Use ELK stack or similar
3. Set up log rotation

## Backup Strategy

### Database Backups

1. MongoDB Atlas: Enable automatic backups
2. Self-hosted: Create backup scripts
```bash
mongodump --uri="mongodb://user:pass@localhost:27017/tubegrow" --out=/backup/$(date +%Y%m%d)
```

### File Backups

1. Backup application code
2. Backup configuration files
3. Store backups in multiple locations

## Performance Optimization

### Backend

1. Enable caching (Redis)
2. Optimize database queries
3. Use CDN for static assets
4. Implement rate limiting

### Frontend

1. Enable code splitting
2. Optimize images
3. Use service workers
4. Implement lazy loading

## Security Best Practices

1. Use environment variables for secrets
2. Enable HTTPS everywhere
3. Implement rate limiting
4. Regular security updates
5. Use firewalls
6. Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check MongoDB connection string
   - Verify MongoDB is running
   - Check network connectivity

2. **API requests failing**
   - Check CORS configuration
   - Verify API endpoints
   - Check authentication tokens

3. **Frontend not loading**
   - Check build process
   - Verify static file serving
   - Check browser console for errors

### Health Checks

Backend health check endpoint:
```bash
curl http://localhost:5000/api/health
```

### Logs

View Docker logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Scaling

### Horizontal Scaling

1. Load balance multiple backend instances
2. Use database connection pooling
3. Implement session affinity if needed

### Vertical Scaling

1. Increase server resources
2. Optimize application performance
3. Monitor resource usage

## Maintenance

### Regular Tasks

1. Update dependencies
2. Security patches
3. Database maintenance
4. Log cleanup
5. Performance monitoring

### Update Process

1. Backup current version
2. Update code
3. Run migrations if needed
4. Test thoroughly
5. Deploy to production
6. Monitor for issues

## Support

For issues and questions:
1. Check the documentation
2. Review error logs
3. Check GitHub issues
4. Contact support team

---

**Note**: This deployment guide covers the most common scenarios. Adjust based on your specific requirements and infrastructure.
