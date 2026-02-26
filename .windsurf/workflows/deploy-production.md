---
description: Deploy application to production
---

# Production Deployment Workflow

This workflow automates the deployment of your rental agreement management system to production.

## Prerequisites
- Ensure you have your production server credentials configured
- Environment variables should be set in your production environment
- MongoDB database should be accessible from production

## Deployment Steps

### 1. Backend Deployment
```bash
# Navigate to backend directory
cd backend

# Install production dependencies
npm ci --production

# Set environment variables
export NODE_ENV=production
export MONGO_URI=your_production_mongodb_uri
export JWT_SECRET=your_production_jwt_secret

# Start production server
npm start
```

### 2. Frontend Deployment
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Deploy build files to your web server
# Example for nginx: copy dist/* to /var/www/html/
```

### 3. Database Setup
- Ensure MongoDB is running on production server
- Create necessary indexes for performance
- Set up database backups

### 4. SSL Certificate Setup
- Configure SSL certificates for HTTPS
- Update nginx/Apache configuration
- Test SSL configuration

### 5. Environment Variables
Create `.env` file in production with:
```
NODE_ENV=production
MONGO_URI=mongodb://your-production-db-url
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

## Monitoring & Maintenance

### Health Checks
- Monitor server logs
- Set up uptime monitoring
- Check database connectivity

### Backup Strategy
- Daily database backups
- Code repository backups
- File system backups

## Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000/3001 and 5000 are available
2. **Database connection**: Verify MongoDB URI and credentials
3. **Environment variables**: Check all required variables are set
4. **File permissions**: Ensure upload directories have proper permissions

### Log Locations
- Backend logs: Check your process manager logs (PM2, systemd, etc.)
- Frontend logs: Check web server logs (nginx, Apache)
- Database logs: MongoDB logs

## Security Considerations

1. **API Security**
   - Enable rate limiting
   - Implement input validation
   - Use HTTPS only

2. **Database Security**
   - Use strong authentication
   - Enable network encryption
   - Regular security updates

3. **File Upload Security**
   - Validate file types
   - Scan for malware
   - Limit file sizes

## Performance Optimization

1. **Backend**
   - Enable gzip compression
   - Implement caching
   - Use CDN for static files

2. **Frontend**
   - Enable code splitting
   - Optimize images
   - Use lazy loading

## Rollback Plan

If deployment fails:
1. Keep previous version backup
2. Database rollback scripts ready
3. Quick revert procedures documented
4. Communication plan for users
