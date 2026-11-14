# Domain checker website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jakes-projects-89b0d91f/v0-domain-checker-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/8jV1TEbX1cM)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/jakes-projects-89b0d91f/v0-domain-checker-website](https://vercel.com/jakes-projects-89b0d91f/v0-domain-checker-website)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/8jV1TEbX1cM](https://v0.app/chat/projects/8jV1TEbX1cM)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository


## Filters

Lightspeed and FortiGuard are checked by default; the rest are opt-in from the UI.

| Key | Filter |
| --- | --- |
| `lightspeed` | Lightspeed (WebSocket lookup) |
| `fortiguard` | FortiGuard |
| `cisco` | Cisco Talos |
| `goguardian` | GoGuardian |
| `linewize` | Linewize |
| `blocksi` / `blocksiai` | Blocksi (standard / AI classifier) |
| `senso` | Senso |
| `lanschool` | LanSchool (Netsweeper) |

Each filter lives in `lib/filters/<name>.ts` with its category data in `lib/filters/data/`.
To add one, write a module that exports `(host) => Promise<{ status, category }>`, register it in
`lib/filters/index.ts`, and add an entry to `lib/filters/meta.ts`. The UI and API pick it up automatically.

### Optional environment variables

| Variable | Purpose |
| --- | --- |
| `LIGHTSPEED_WEBSOCKET_URL`, `LIGHTSPEED_IP`, `LIGHTSPEED_CUSTOMER_ID` | Override the Lightspeed lookup endpoint/identity |
| `GOGUARDIAN_TOKEN_URL` | Source of the encrypted GoGuardian bearer token (lookups return `Error` without a live one) |
| `LANSCHOOL_URL` | Netsweeper appliance to query for LanSchool |

The `/api/check-links` route runs on the Node.js runtime (it needs `ws` for Lightspeed) and accepts up to 25 domains per request.
