## Draxion

Draxion is a production-minded MVP for **AI-assisted lead generation and outreach**:
- Find/import leads (public web + CSV)
- Enrich companies from their websites
- Generate personalized outreach (ET/EN/RU)
- Run email campaigns (Resend)

## Getting Started

### Setup checklist

- **1) Install deps**

```bash
npm install
```

- **2) Create env file**

```bash
cp .env.example .env
```

- **3) Configure Supabase**
  - Set `NEXT_PUBLIC_SUPABASE_URL`
  - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **4) Configure database**
  - Set `DATABASE_URL` (Postgres)
  - Run Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

- **5) (Optional) Enable mock lead search**
  - `LEADFORGE_ENABLE_MOCK_PUBLIC_WEB=1`

- **6) Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000`.

### Tests

```bash
npm run test
```

## Troubleshooting (common failures)

### “Missing Supabase env…”
- Ensure `.env` contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### “Missing DATABASE_URL” / Prisma errors
- Make sure Postgres is running and `DATABASE_URL` is correct.
- Re-run:

```bash
npx prisma generate
npx prisma migrate dev
```

### Resend sending not configured
- Add `RESEND_API_KEY` to `.env`. The app will **not** fake sends.

### OpenAI features not working
- Add `OPENAI_API_KEY` to `.env`.

### “Next.js inferred your workspace root…”
- This repo can contain multiple lockfiles. `next.config.ts` pins Turbopack root to the `leadforge/` directory.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
