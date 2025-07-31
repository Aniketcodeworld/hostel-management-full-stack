# Hostel Management System

A modern web application for managing hostel operations, including room allocation, maintenance tracking, and complaint management.

## Features

- **Authentication System**
  - Role-based access control (Admin & Allottee)
  - Secure login with Google
  - Admin login with credentials

- **Dashboard**
  - Overview of hostel statistics
  - Quick access to important features
  - Responsive design for all devices

- **Room Management**
  - View and manage room allocations
  - Track room availability
  - Room status updates

- **Complaint System**
  - Submit and track complaints
  - Admin response system
  - Status updates and notifications

- **Maintenance Tracking**
  - Schedule and track maintenance tasks
  - Priority-based task management
  - Maintenance history

## Tech Stack

- **Frontend**
  - Next.js 14
  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn UI
  - Framer Motion

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL
  - NextAuth.js

- **Authentication**
  - NextAuth.js
  - Google OAuth
  - Custom credentials provider

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/hostel-management.git
cd hostel-management
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
hostel-management/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── auth/            # Authentication pages
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
├── contexts/           # React contexts
├── lib/               # Utility functions
├── prisma/           # Database schema
└── public/          # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Shadcn UI for the beautiful components
- All contributors and maintainers 