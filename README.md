# Task-Management-Net-React

## ✅ Completed Features

### Backend

- **Middleware**

  - Validation Middleware: Handles validation errors globally and logs them
  - Exception Middleware: Handles unhandled exceptions globally and provides user-friendly responses

- **User Management**

  - Admin Capabilities:
    - View all users (GET /api/user)
    - View a specific user by ID (GET /api/user/{id})
    - Delete users (DELETE /api/user/{id})
  - Customer Capabilities:
    - View their own details (GET /api/user/self)
  - Authentication:
    - Sign up as a customer (POST /api/user/signup)
    - Login (POST /api/user/login)

- **UserController**

  - Set up CRUD operations (GET, POST, PUT, DELETE)
  - Added validation to ensure proper input handling
  - Enforced email uniqueness
  - Included structured error handling

- **Database**
  - Set up SQL Server in Docker container
  - Configured Entity Framework Core
  - Created initial user schema

### Frontend

- React + TypeScript application setup
- Authentication system with cookies
- Protected routes implementation
- API client integration
- Component architecture established
- Key pages (Login, Signup, Dashboard, Admin Panel)

## 🔧 Tech Stack

- Backend: ASP.NET Core Web API (C#)
- Database: SQL Server (Docker container, connected via Entity Framework Core)
- Frontend: React (JavaScript/TypeScript) + Tailwind CSS
- Real-time Updates: WIP
- API Testing: Postman (current) + Automated testing (future)
- Version Control: GitHub

## 📝 To-Do

### Backend

- Implement Task Management API
- Enhance role-based authorization
- Complete user profile management
- Create unit and integration tests

### Frontend

- Build task management UI components
- Complete dashboard functionality
- Finalize admin control panel
- Add user profile management UI
- Implement responsive design with Tailwind CSS
