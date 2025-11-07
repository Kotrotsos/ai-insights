# Railway Deployment Guide

## Prerequisites

- Railway account
- PostgreSQL database provisioned in Railway
- GitHub repository connected to Railway

## Environment Variables

Set these in Railway dashboard:

```env
DATABASE_URL=postgresql://postgres:oRBbtSquAWIcfcGDahBJsSIqmJRXMdTk@postgres.railway.internal:5432/railway
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-domain.railway.app
```

## Initial Deployment

1. **Connect Repository**
   - Link your GitHub repo to Railway
   - Railway auto-detects Next.js

2. **Configure Build**
   - Build Command: `npm run build` (automatically runs `prisma generate`)
   - Start Command: `npm start`

3. **Run Database Migrations**

   After first deploy, run migrations:
   ```bash
   railway run npx prisma migrate deploy
   ```

4. **Seed Database**

   Create initial admin user and categories:
   ```bash
   railway run npx prisma db seed
   ```

5. **Verify Deployment**
   - Visit your Railway URL
   - Login at `/auth/signin` with seeded admin credentials
   - Create your first post

## Subsequent Deployments

Railway will automatically:
1. Install dependencies
2. Generate Prisma client (`postinstall` script)
3. Build Next.js app
4. Deploy

Migrations must be run manually after schema changes:
```bash
railway run npx prisma migrate deploy
```

## Database Management

**Prisma Studio (local):**
```bash
npx prisma studio
```

**View logs:**
```bash
railway logs
```

**Connect to database:**
```bash
railway connect postgres
```

## Rollback

If deployment fails:
1. Check Railway logs
2. Roll back to previous deployment in Railway dashboard
3. If migration failed, resolve and redeploy

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is randomly generated (not default)
- [ ] `DATABASE_URL` uses internal Railway URL in production
- [ ] `.env.local` is in `.gitignore`
- [ ] Admin password changed from seed default
- [ ] HTTPS enforced (Railway handles this)

## Monitoring

Watch for:
- Database connection count (Railway dashboard)
- Response times
- Error rates in logs
- Disk usage

## Common Issues

**Build fails with "Prisma not generated":**
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check Railway database is running
- Ensure internal URL used in production

**Auth fails:**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

## Support

- Railway docs: https://docs.railway.app
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
