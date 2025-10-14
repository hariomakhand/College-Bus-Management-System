# Bus Management System

A comprehensive bus management system built with React.js frontend and Node.js backend.

## Features

- **Role-based Authentication**: Student, Driver, and Admin roles
- **Email Verification**: OTP-based email verification system
- **Password Reset**: Secure password reset functionality
- **Bus Management**: Track buses, routes, and schedules
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