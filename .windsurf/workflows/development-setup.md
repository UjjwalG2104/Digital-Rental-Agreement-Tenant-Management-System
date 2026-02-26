---
description: Development setup and local workflow
---

# Development Setup Workflow

This workflow guides you through setting up the development environment and daily development tasks.

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/UjjwalG2104/Digital-Rental-Agreement-Tenant-Management-System.git
cd Digital-Rental-Agreement-Tenant-Management-System
```

### 2. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment (if needed)
cd ../frontend
# Create .env file if required
```

### 4. Database Setup
```bash
# Start MongoDB (if using local)
mongod

# Or connect to MongoDB Atlas
# Update .env with your Atlas connection string
```

## Daily Development Workflow

### 1. Start Development Servers
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Development Branch Strategy
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: implement your feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request when ready
```

### 3. Testing During Development
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run all tests from root
npm run test:all
```

## Code Quality Workflow

### 1. Pre-commit Checks
```bash
# Format code
npm run format

# Run linter
npm run lint

# Run type checking
npm run type-check

# Run all quality checks
npm run check
```

### 2. Commit Guidelines
Use conventional commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

Examples:
```bash
git commit -m "feat: add property image upload functionality"
git commit -m "fix: resolve login authentication issue"
git commit -m "docs: update API documentation"
```

## Feature Development Workflow

### 1. Backend Feature Development
```bash
# 1. Create/update model
# Edit models/YourModel.js

# 2. Create/update controller
# Edit controllers/yourController.js

# 3. Create/update routes
# Edit routes/yourRoutes.js

# 4. Test your API
# Use Postman, curl, or frontend

# 5. Add tests
# Create tests/yourController.test.js
```

### 2. Frontend Feature Development
```bash
# 1. Create component
# Create src/components/YourComponent.jsx

# 2. Add routing
# Edit src/App.jsx or routing file

# 3. Add state management
# Use useState, useEffect, or context

# 4. Style component
# Add CSS or use existing classes

# 5. Test component
# Create tests/YourComponent.test.js
```

## Debugging Workflow

### 1. Common Issues & Solutions

#### Backend Issues
```bash
# Check MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"

# Check port availability
netstat -an | grep 5000

# Check logs
tail -f logs/error.log
```

#### Frontend Issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check proxy configuration
# Verify vite.config.mjs proxy settings

# Check browser console
# Open developer tools and inspect errors
```

### 2. Debugging Tools
- **Backend**: VS Code debugger, console.log, MongoDB Compass
- **Frontend**: React DevTools, browser console, Redux DevTools
- **Network**: Postman, Insomnia, browser network tab

## Database Workflow

### 1. Database Operations
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/rental_system"

# Common operations
db.users.find()                    # List users
db.properties.find()                # List properties
db.agreements.find()               # List agreements
```

### 2. Database Seeding
```bash
# Seed sample data
cd backend
npm run seed

# Reset database
npm run db:reset
```

## Deployment Workflow

### 1. Pre-deployment Checks
```bash
# Run full test suite
npm run test:coverage

# Check build
npm run build

# Security audit
npm audit
```

### 2. Git Workflow for Deployment
```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Merge develop branch
git merge develop

# 3. Run tests
npm test

# 4. Tag release
git tag -a v1.0.0 -m "Release version 1.0.0"

# 5. Push to main
git push origin main --tags
```

## Collaboration Workflow

### 1. Code Review Process
1. Create pull request
2. Request review from team members
3. Address feedback
4. Update PR as needed
5. Merge after approval

### 2. Conflict Resolution
```bash
# Update main branch
git checkout main
git pull origin main

# Rebase feature branch
git checkout feature/your-branch
git rebase main

# Resolve conflicts
# Edit conflicted files
git add .
git rebase --continue
```

## Performance Optimization

### 1. Development Performance
```bash
# Use nodemon for auto-restart
npm run dev

# Enable hot reload in frontend
# Vite automatically handles this

# Use database indexes
# Create indexes in models for faster queries
```

### 2. Code Splitting
```bash
# Frontend code splitting
# Use lazy loading for components
const Component = React.lazy(() => import('./Component'));

# Backend optimization
# Use pagination for large datasets
# Implement caching strategies
```

## Troubleshooting Guide

### Common Development Issues

#### Port Conflicts
```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

#### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json
npm install
```

#### MongoDB Issues
```bash
# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB status
sudo systemctl status mongod
```

## Best Practices

### 1. Code Organization
- Keep components small and focused
- Use descriptive naming conventions
- Follow consistent file structure
- Document complex logic

### 2. Security Practices
- Never commit sensitive data
- Use environment variables
- Validate all inputs
- Implement proper authentication

### 3. Performance Practices
- Optimize database queries
- Use appropriate data structures
- Implement caching where needed
- Monitor application performance

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express Documentation](https://expressjs.com/)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [Git](https://git-scm.com/)
