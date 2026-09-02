# St. Mochtas GFC Website

Official website project for St. Mochtas GFC, Louth Village, County Louth.

Live website: https://st-mochtas-gfc-louth.lively-teal-9910.chatgpt.site

## Technology

- Next.js and React
- Vinext / Cloudflare Workers
- Cloudflare D1 for website and archive records
- Cloudflare R2 for uploaded photographs and documents
- Supabase Auth for independent club administrator sign-in
- OpenAI Sites for hosting and deployment

## Local development

1. Install Node.js 22.13 or newer and pnpm.
2. Run `pnpm install`.
3. Copy the values described in `.env.example` into a local `.env.local`.
4. Run `pnpm dev`.

Never commit real environment values or administrator secrets.

## Administration and handover

See [ADMIN_HANDOVER.md](ADMIN_HANDOVER.md) for the club administrator, archive, backup and handover procedures.

## Stored content

This repository contains the website source code. Live administrator edits, database records and uploaded archive files are stored by the hosted website services and are not contained in GitHub.
