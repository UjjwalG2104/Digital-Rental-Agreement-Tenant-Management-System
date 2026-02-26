---
description: Automated CI/CD pipeline for testing and deployment
---

# CI/CD Pipeline Workflow

This workflow sets up automated testing and deployment using GitHub Actions.

## GitHub Actions Setup

### 1. Create Workflow File
Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/
    
    - name: Install backend dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run backend tests
      run: |
        cd backend
        npm test
      env:
        MONGO_URI: mongodb://localhost:27017/test_rental_system
        JWT_SECRET: test_secret
        NODE_ENV: test

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm test
    
    - name: Build frontend
      run: |
        cd frontend
        npm run build

  deploy-staging:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment..."
        # Add your staging deployment commands here
        
  deploy-production:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production environment..."
        # Add your production deployment commands here
```

### 2. Environment Setup

#### Production Secrets
Add these secrets to your GitHub repository:
- `MONGO_URI`
- `JWT_SECRET`
- `STAGING_HOST`
- `PRODUCTION_HOST`

#### Staging Environment
```bash
# Staging deployment commands
ssh user@staging-server "cd /var/www/rental-app && git pull origin develop && npm install && npm run build && pm2 restart rental-app"
```

#### Production Environment
```bash
# Production deployment commands
ssh user@production-server "cd /var/www/rental-app && git pull origin main && npm install && npm run build && pm2 restart rental-app"
```

## Local Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... develop your feature ...

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### 2. Testing Workflow
```bash
# Run all tests
npm run test:all

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 3. Pre-commit Hooks
Setup husky for pre-commit checks:

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

## Branch Strategy

### Main Branches
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `hotfix/*`: Emergency fixes

### Merge Rules
1. **Feature → Develop**: Pull request with tests passing
2. **Develop → Main**: Pull request after staging approval
3. **Hotfix → Main**: Direct merge for emergency fixes

## Quality Gates

### Automated Checks
- ✅ All tests must pass
- ✅ Code coverage > 80%
- ✅ No linting errors
- ✅ Build must succeed
- ✅ Security scan passes

### Manual Reviews
- Code review required for all PRs
- At least one approval needed
- Design review for UI changes
- Architecture review for major changes

## Monitoring & Alerts

### Deployment Monitoring
- Slack notifications for deployments
- Email alerts for failures
- Uptime monitoring
- Performance metrics tracking

### Rollback Procedures
```bash
# Quick rollback to previous version
git revert HEAD
git push origin main

# Full rollback procedure
ssh server "cd /app && git checkout previous-tag && npm install && pm2 restart"
```

## Best Practices

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Test additions
- `chore:` Maintenance tasks

### Release Process
1. Update version numbers
2. Update changelog
3. Create release tag
4. Deploy to production
5. Monitor deployment

### Security
- Regular dependency updates
- Security scanning
- Access control
- Audit logging
