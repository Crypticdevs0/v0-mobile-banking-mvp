# Mobile Banking MVP - Architecture

## Project Structure

\`\`\`
mobile-banking-mvp/
├── backend/                          # Node.js + Express server
│   ├── server.js                     # Main Express + Socket.io server
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   ├── accounts.js               # Account operations
│   │   ├── transfers.js              # Transfer endpoints
│   │   └── transactions.js           # Transaction history
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   └── logger.js                 # Request logging
│   ├── services/
│   │   ├── fineractService.js        # Fineract API integration
│   │   ├── socketService.js          # Socket.io event handling
│   │   └── cacheService.js           # Response caching
│   └── utils/
│       └── fineractClient.js         # Fineract HTTP client
│
├── app/                              # Next.js frontend
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Tailwind + theme tokens
│   ├── page.tsx                      # Dashboard page
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── api/                          # Backend route handlers
│   │   └── socket-init.ts            # Socket initialization
│   └── components/
│       ├── dashboard/
│       │   ├── header.tsx            # Top header
│       │   ├── balance-card.tsx      # Balance display
│       │   ├── quick-actions.tsx     # Quick action buttons
│       │   ├── transactions-list.tsx # Transaction history
│       │   └── bottom-nav.tsx        # Sticky navigation
│       ├── transfer/
│       │   ├── transfer-modal.tsx    # Transfer form modal
│       │   ├── transfer-form.tsx     # Form component
│       │   └── confirmation.tsx      # Confirmation screen
│       ├── common/
│       │   ├── toast.tsx             # Toast notifications
│       │   ├── loader.tsx            # Loading skeleton
│       │   └── avatar.tsx            # User avatar
│       └── hooks/
│           ├── useAuth.ts            # Auth hook
│           ├── useBalance.ts         # Balance hook
│           ├── useSocket.ts          # Socket hook
│           └── useTransactions.ts    # Transactions hook
│
├── public/
│   └── (static assets)
└── README.md
\`\`\`

## Technology Stack

- **Backend**: Node.js + Express.js + Socket.io
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **API**: Fineract 1.12.1 Sandbox
- **Database**: MySQL (via Fineract)
- **Real-time**: Socket.io WebSocket
- **Icons**: Lucide React
- **Charts**: Recharts

## Key Features

1. **Authentication**: JWT-based login/signup
2. **Real-time Balance Updates**: Socket.io broadcasting
3. **Instant Transfers**: With validation & confirmation
4. **Transaction History**: Paginated, filterable list
5. **Live Notifications**: Toast alerts on transactions
6. **Smooth Animations**: Framer Motion micro-interactions
7. **Dark/Light Mode**: Theme toggle support
8. **Mobile-First**: Responsive design for all devices
