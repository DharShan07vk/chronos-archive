# Chronos Archive

A brutalist-aesthetic digital time capsule app — seal your memories, thoughts, and media behind a date lock and rediscover them when the moment arrives.

## Features

- **Time-Locked Capsules** — set any future unlock date; content stays sealed until then
- **Rich Content** — attach text, photos, and videos to each capsule
- **Share** — send capsules to others via email
- **Weather Snapshot** — optionally record the weather at the time of creation
- **Dashboard** — at-a-glance view of all your capsules with lock/unlock status
- **Authentication** — private capsule library per user (register & login)
- **GSAP Animations** — smooth scroll-triggered transitions and a live millisecond clock on the landing page

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Animations | GSAP + ScrollTrigger |
| State | React Context API |
| Data Fetching | TanStack Query |
| Testing | Vitest + Testing Library |
| Package Manager | Bun |

## Project Structure

```
src/
├── components/       # Shared UI & brutalist design primitives
│   └── ui/           # shadcn/ui component library
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Route-level page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CreateCapsule.tsx
│   └── ViewCapsule.tsx
├── store/            # Context-based global state
│   ├── authStore.tsx
│   └── capsuleStore.tsx
└── test/             # Test setup and example tests
```

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org) or [Bun](https://bun.sh)

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd chronos-archive

# Install dependencies
bun install        # or: npm install

# Start the development server
bun run dev        # or: npm run dev
```

The app will be available at `http://localhost:5173`.

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start development server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint |
| `bun run test` | Run tests (Vitest) |
| `bun run test:watch` | Run tests in watch mode |

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
