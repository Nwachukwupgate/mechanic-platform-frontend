# Mechanic Platform Frontend

React frontend application for the Mechanic Marketplace Platform built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 🔐 User and Mechanic authentication flows
- 📧 Email verification
- 🚗 Vehicle management
- 🔧 Fault selection with guided questions
- 📍 Location-based mechanic search
- 💬 Real-time chat with Socket.io
- 📊 Job tracking and status updates
- ⭐ Rating and review system
- 📱 Mobile-friendly design

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **WebSockets**: Socket.io Client
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository:
```bash
cd mechanic-platform-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `VITE_API_URL`: Backend API URL (default: http://localhost:4000)
- `VITE_GOOGLE_MAPS_KEY`: Google Maps API key (optional, for enhanced map features)

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── pages/
│   ├── public/        # Public pages (Home, For Users, For Mechanics)
│   ├── auth/          # Authentication pages (Login, Register, Verify Email)
│   ├── user/          # User-specific pages
│   └── mechanic/      # Mechanic-specific pages
├── components/        # Reusable components
├── layouts/           # Layout components
├── hooks/             # Custom React hooks
├── services/          # API and Socket.io services
├── store/             # Zustand stores
├── contexts/          # React contexts
├── routes/            # Route configuration
└── styles/            # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Flow

1. **Registration**: Users or Mechanics register with their details
2. **Email Verification**: Verify email address via link
3. **Profile Setup**: Complete profile information
4. **For Users**:
   - Add vehicles
   - Select fault/issue
   - Find nearby mechanics
   - Create booking
   - Chat with mechanic
   - Track job status
   - Rate mechanic after completion
5. **For Mechanics**:
   - Complete profile with expertise and location
   - Set availability
   - Receive job requests
   - Accept bookings
   - Update job status
   - Chat with customers
   - Provide cost estimates

## Environment Variables

See `.env.example` for all required environment variables.

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## License

MIT
