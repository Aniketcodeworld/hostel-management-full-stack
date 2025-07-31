# Hostel Management Express Server

This is a separate Express server for the Hostel Management System.

## Overview

The Express server provides an API for managing hostel data including:

- Students
- Rooms
- Complaints

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/hostel-management?retryWrites=true&w=majority

# Server Port
PORT=5000
```

3. Seed the database with sample data:

```bash
npm run server:seed
```

## Usage

### Starting the Server

Start in production mode:

```bash
npm run server
```

Start in development mode (with auto-restart on file changes):

```bash
npm run server:dev
```

### API Endpoints

#### Students

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

#### Complaints

- `GET /api/complaints` - Get all complaints
  - Query params: `studentId`, `status`
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create a new complaint
- `PUT /api/complaints/:id` - Update a complaint
- `DELETE /api/complaints/:id` - Delete a complaint

#### Rooms

- `GET /api/rooms` - Get all rooms
  - Query params: `hostelBlock`, `status`, `type`
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create a new room
- `PUT /api/rooms/:id` - Update a room
- `DELETE /api/rooms/:id` - Delete a room

## Integration with Frontend

The frontend connects to this Express server using the API client in `lib/api.ts`. The API base URL is configured in the `.env.local` file with the `NEXT_PUBLIC_API_URL` variable.

To use the API client in your frontend components:

```typescript
import { studentAPI, complaintAPI, roomAPI } from '@/lib/api';

// Example usage
async function fetchStudents() {
  const students = await studentAPI.getAll();
  console.log(students);
}
```

## Folder Structure

- `server/` - Root directory for the Express server
  - `models/` - Mongoose models
  - `routes/` - Express route handlers
  - `server.ts` - Main server file
  - `seed.ts` - Database seeding script 