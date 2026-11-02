# Deploy LiftFund Frontend to Contabo (app.helpfunde.com)

The frontend is a static Vite SPA. GitHub Actions builds `dist/` and rsyncs it to the
server; nginx serves the files and falls back to `index.html` for client-side routes.

```
GitHub (push to main)
   -> .github/workflows/deploy-contabo.yml
   -> yarn install + yarn build  (VITE_API_BASE_URL=https://api.helpfunde.com)
   -> rsync dist/ -> /var/www/liftfund-fe/
nginx (TLS) -> /var/www/liftfund-fe  (try_files ... /index.html)
                 -> /uploads/* proxied to backend 127.0.0.1:9032
```

## 1. GitHub secrets

Same secrets as the backend workflow (repo -> Settings -> Secrets and variables -> Actions):

| Secret | Value |
|--------|-------|
| `SSH_HOST` | Contabo IP or hostname |
| `SSH_USER` | deploy user |
| `SSH_PRIVATE_KEY` | private key with the public half in the user's `~/.ssh/authorized_keys` |
| `SSH_PORT` | optional, defaults to `22` |

## 2. Server directory

Do **not** use `/root` — nginx runs as `www-data` and cannot read `/root`. Use
`/var/www/liftfund-fe`:

```bash
sudo mkdir -p /var/www/liftfund-fe
sudo chown -R "$USER":"$USER" /var/www/liftfund-fe
sudo chmod -R 755 /var/www/liftfund-fe
```

The rsync deploy will populate this directory on the first push.

## 3. nginx site (app.helpfunde.com)

`/etc/nginx/sites-available/app.helpfunde.com`:

```nginx
server {
    listen 80;
    server_name app.helpfunde.com;

    root /var/www/liftfund-fe;
    index index.html;

    # SPA history mode: unknown paths serve the app shell.
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hashed build assets can be cached aggressively.
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Defensive: if any image URL is relative, serve it from the backend.
    location /uploads/ {
        proxy_pass http://127.0.0.1:9032;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable it and add TLS:

```bash
sudo ln -s /etc/nginx/sites-available/app.helpfunde.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d app.helpfunde.com
```

## 4. Build-time API URL

The production build uses `VITE_API_BASE_URL`. `.env.production` is set to
`https://api.helpfunde.com`, and the workflow also passes it explicitly. If you change
the backend domain later, update both.

> Pushing this repo also triggers a Vercel rebuild. Once `.env.production` points at
> `api.helpfunde.com`, the Vercel site will call the Contabo backend, so make sure
> `api.helpfunde.com` has working TLS before relying on either site.

## 5. Backend values that must match `app.helpfunde.com`

On the backend `/etc/liftfund/liftfund.env`:

- `APP_DOMAIN=https://app.helpfunde.com`
- `VERIFICATION_URL=https://app.helpfunde.com/set-password`
- `PAYPAL_REDIRECT_URL=https://app.helpfunde.com/donations/success`
- `STRIPE_REDIRECT_URL=https://app.helpfunde.com/donations/success`

And in the gateways:

- PayPal return URL -> `https://app.helpfunde.com/donations/success`
- Stripe webhook -> `https://api.helpfunde.com/api/v1/campaigns/webhook/stripe`

CORS is already `Access-Control-Allow-Origin: *` on the backend, so no extra config.

## 6. Deploy flow

Push to `main`. Actions runs `yarn install --frozen-lockfile`, `yarn build`, then rsyncs
`dist/` to `/var/www/liftfund-fe/` (with `--delete`, so removed assets are cleaned up).
No service restart is needed — nginx serves files from disk.

Verify:

```bash
curl -I https://app.helpfunde.com
curl -I https://app.helpfunde.com/campaign/123   # should be 200 (SPA fallback)
```

## Troubleshooting

- **404 on refresh / deep links** -> missing `try_files ... /index.html` in nginx.
- **Blank page / API errors** -> wrong `VITE_API_BASE_URL` in the build; rebuild.
- **Images 404** -> set backend `PUBLIC_BASE_URL=https://api.helpfunde.com` and keep the
  `/uploads/` proxy, or restart the backend after changing it.
- **rsync permission denied** -> `/var/www/liftfund-fe` owned by another user or not
  writable by `SSH_USER`.
- **401/403 from API** -> CORS is `*`; check that `api.helpfunde.com` responds over HTTPS.
