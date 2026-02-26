# SaukiMart Deployment Guide

## Deployment Overview

This guide covers the deployment process for SaukiMart, a comprehensive digital services platform for Nigeria's users to buy data, pay bills, and shop for gadgets.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/saukimart

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=https://saukimart.online

# Firebase (Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Payment Integrations
FLUTTERWAVE_SECRET_KEY=your_flutterwave_key
INTERSWITCH_AUTH_STRING=your_interswitch_auth
AMIGO_API_TOKEN=your_amigo_api_token
AMIGO_PROXY_URL=your_aws_proxy_url

# Notifications (Firebase Cloud Messaging - uses Firebase config above)
# No additional setup needed
```

## Contact & Support

### Admin
- **Email**: admin@saukimart.online
- **Escalations**: escalations@saukimart.online

### Support Team
- **Email**: support@saukimart.online
- **Phone**: +2347044647081
- **Phone**: +2349024099561
- **Hours**: Monday - Friday, 9 AM - 6 PM WAT

## Deployment Steps

### 1. Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 2. Build the Application

```bash
npm run build
```

### 3. Run in Production

```bash
npm start
```

## Server Configuration

### Recommended Specs
- **CPU**: 2+ cores
- **RAM**: 2GB minimum
- **Storage**: 20GB SSD
- **Node.js**: v18+ (LTS)
- **PostgreSQL**: 13+

### Using Docker

```bash
docker build -t saukimart:latest .
docker run -p 3000:3000 -e DATABASE_URL=... saukimart:latest
```

## Monitoring & Logging

- All errors are logged to the application logs
- Monitor `/admin/failed` for failed transactions
- Check `/admin/notifications` for notification status
- Review user activity through `/admin/users`

## Security Checklist

- [ ] Ensure `NEXT_PUBLIC_APP_URL` matches your domain
- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS only
- [ ] Keep all API keys in environment variables
- [ ] Regularly rotate authentication tokens
- [ ] Review admin access logs
- [ ] Backup database regularly

## Maintenance

### Regular Tasks
- Monitor failed transactions
- Review user support tickets
- Update data plans and electricity disco rates
- Monitor payment processing status

### Backup Strategy
```bash
# Daily database backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Store backups securely
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall rules

### Payment Processing Failures
- Review logs at `/admin/failed`
- Check payment provider credentials
- Verify webhook configurations

### Performance Issues
- Monitor server resources
- Optimize database queries
- Cache frequently accessed data
- Enable Redis caching if needed

## Rollback Procedure

If issues occur during deployment:

```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back migration_name

# Rebuild and redeploy
npm run build && npm start
```

## Support Contacts

For deployment-related issues, contact:

- **Technical Support**: support@saukimart.online
- **Admin Issues**: admin@saukimart.online
- **Emergency**: +2347044647081 or +2349024099561
