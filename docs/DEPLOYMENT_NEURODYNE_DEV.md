# NeuroDyne production deployment

## Public host map

| Surface | Production host | Platform |
|---|---|---|
| Marketing website | `https://neurodyne.dev` | Vercel (`apps/web`) |
| Client portal | `https://client.neurodyne.dev` | Vercel (`apps/client`) |
| Admin dashboard | `https://admin.neurodyne.dev` | Vercel (`apps/admin`) |
| API | `https://api.neurodyne.dev` | Render (`apps/server`) |

The marketing site is indexable. The client and admin apps send both HTML `noindex` metadata and
an `X-Robots-Tag: noindex, nofollow, noarchive` response header.

## Vercel projects

Create or update three Vercel projects using the application directories above as their root
directories. Add domains in each project's **Settings → Domains**:

- Web: `neurodyne.dev` and `www.neurodyne.dev` (redirect `www` to the apex).
- Client: `client.neurodyne.dev`.
- Admin: `admin.neurodyne.dev`.

Set production environment variables:

```text
# apps/web
VITE_API_URL=https://api.neurodyne.dev
VITE_SITE_URL=https://neurodyne.dev
VITE_CLIENT_PORTAL_URL=https://client.neurodyne.dev

# apps/client and apps/admin
VITE_API_URL=https://api.neurodyne.dev
```

Custom domains are assigned in Vercel project settings, not committed as deprecated `alias`
configuration. Keep `trailingSlash: false` to avoid duplicate indexable URLs.

## Render API

`render.yaml` declares `api.neurodyne.dev`. After the Blueprint exists, add the DNS record Render
shows for that custom domain and verify its certificate. Set every `sync: false` secret in Render:

```text
NEURODYNE_MONGODB_URI
NEURODYNE_PROJECT_INTAKE_NOTIFY_TO
NEURODYNE_RESEND_API_KEY
OPENAI_API_KEY                 # optional; deterministic brief coaching works without it
NEURODYNE_CLOUDINARY_CLOUD_NAME
NEURODYNE_CLOUDINARY_API_KEY
NEURODYNE_CLOUDINARY_API_SECRET
NEURODYNE_PAYMENT_PROVIDER
NEURODYNE_PAYSTACK_SECRET_KEY  # or Stripe equivalents
```

Use a verified Resend sender for `NEURODYNE_EMAIL_FROM`. Set
`NEURODYNE_PROJECT_INTAKE_NOTIFY_TO` to the inbox that should receive submitted briefs.

## DNS and launch checks

1. Add the Vercel records shown for the apex, `www`, `client`, and `admin` hosts.
2. Add the Render record shown for `api`.
3. Verify HTTPS on all four hosts before enabling HSTS preload externally.
4. Confirm `https://neurodyne.dev/robots.txt` and `/sitemap.xml` return XML/text rather than the SPA.
5. Submit one public brief and one client-portal brief; confirm both emails and the admin inbox.
6. Verify the admin and client responses include `X-Robots-Tag: noindex`.
7. Add `https://neurodyne.dev/sitemap.xml` to Google Search Console and Bing Webmaster Tools.
8. Inspect `neurodyne.dev` and `www.neurodyne.dev` to confirm only the apex is canonical.
