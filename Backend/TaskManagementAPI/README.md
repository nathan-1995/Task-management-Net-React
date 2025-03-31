# TaskManagementAPI

## ✅ Done:
### Middlewares:

* Validation Middleware: Handles validation errors globally and logs them.
* Exception Middleware: Handles unhandled exceptions globally and provides user-friendly responses.
* Admin Capabilities:
  * View all users (GET /api/user).
  * View a specific user by ID (GET /api/user/{id}).
  * Delete users (DELETE /api/user/{id}).

* Customer Capabilities:
  * View their own details (GET /api/user/self).

* Signup & Login:
  * Sign up as a customer (POST /api/user/signup).
  * Login (POST /api/user/login).


  
### UserController:

* Set up CRUD operations (GET, POST, PUT, DELETE).
* Added validation to ensure proper input handling.
* Enforced email uniqueness.
* Included structured error handling.


## Tech stack 

* Tech Stack
* Backend: ASP.NET Core Web API (C#)
* Database: SQL Server (Docker container, connected via Entity Framework Core)
* Frontend: React (JavaScript/TypeScript) + Tailwind CSS (later step)
* Authentication: JWT (planned)
* Real-time Updates (optional): SignalR (future step)
* API Testing: Postman (current) + Automated Testing (future)
* Version Control: GitHub (already initialized)

## To-Do
* Add Task Management API
* Enhance User Management
* Set Up Authentication
* Update Database Schema
* Implement Error Handling & Logging
* Update Documentation
