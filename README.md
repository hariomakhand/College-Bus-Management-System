# Bus Management System

A comprehensive bus management system built with React.js frontend and Node.js backend.

## Features

- **Role-based Authentication**: Student, Driver, and Admin roles
- **Email Verification**: OTP-based email verification system
- **Password Reset**: Secure password reset functionality
- **Dynamic Admin Panel**: Real-time data from backend
- **Bus Management**: Complete CRUD operations for buses with status tracking
- **Driver Management**: Add, view, and manage drivers with full details
- **Route Management**: Create and manage bus routes with stops and timing
- **Dashboard Analytics**: Real-time statistics and visual charts
- **User Management**: Manage students, drivers, and admins

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios for API calls
- Bootstrap for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for emails
- Bcrypt for password hashing

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Reset password

### Admin Panel
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/drivers` - Get all drivers
- `POST /api/admin/drivers` - Add new driver
- `DELETE /api/admin/drivers/:id` - Delete driver
- `GET /api/admin/buses` - Get all buses
- `POST /api/admin/buses` - Add new bus
- `DELETE /api/admin/buses/:id` - Delete bus
- `PUT /api/admin/buses/:id/status` - Update bus status
- `GET /api/admin/routes` - Get all routes
- `POST /api/admin/routes` - Add new route
- `DELETE /api/admin/routes/:id` - Delete route
- `PUT /api/admin/assign-bus` - Assign bus to driver

## Project Structure

```
2B-Project/
├── backend/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── server.js
└── Frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── Context/
    │   └── Api.js
    └── public/
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.