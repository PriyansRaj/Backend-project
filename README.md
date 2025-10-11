# 📚 Library Management System API

A full-featured **backend API** built with **Node.js**, **Express**, and **MongoDB** — providing **secure authentication**, **role-based access control**, and **admin user management** for a modern library or book management system.

---

## 🚀 Features

### 👤 User Features
- 🔐 **Signup & Login** using JWT authentication (Access + Refresh Tokens)
- 🧾 **View & Update Profile** details (email, phone number)
- 🗝️ **Change Password** securely with hashing
- 🚪 **Logout** and clear cookies
- ❌ **Delete Account**
- ♻️ **Refresh Access Token** using refresh tokens

### 🧑‍💼 Admin Features
- 👀 **Get All Users** or filter by role/status  
- 🧹 **Delete User Accounts**
- 🔄 **Update User Roles** (e.g., promote user to Admin)
- 💤 **Suspend/Reactivate Users**
- 🔐 **Force Reset User Passwords**
- 📊 **Get User Statistics** (total users, active users, roles breakdown)
- 📚 **Manage Books** (view, add, update, delete)

### 📦 Book Features
- 📖 Fetch all available books
- 🧾 Assign or remove books from users
- 🕒 Track borrowed duration and status

---

## 🏗️ Tech Stack

| Layer | Technology |
|:------|:------------|
| **Backend Framework** | [Express.js](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) with Mongoose |
| **Authentication** | [JWT (JSON Web Tokens)](https://jwt.io/) |
| **Password Security** | bcrypt.js |
| **Environment Management** | dotenv |
| **Error Handling** | Custom `ErrorHandler` and `ResponseHandler` utilities |

---

## ⚙️ Project Structure

📦 library-management-api
├── 📁 controllers
│ ├── user.controller.js
│ ├── admin.controller.js
├── 📁 models
│ ├── User.model.js
│ ├── Book.model.js
├── 📁 middlewares
│ ├── auth.middleware.js
│ ├── role.middleware.js
├── 📁 utils
│ ├── ErrorHandler.js
│ ├── ResponseHandler.js
├── 📁 routes
│ ├── user.routes.js
│ ├── admin.routes.js
├── server.js
├── .env
└── package.json


---

## 🔑 Authentication Flow

1. User **signs up** with username, email, and password.
2. On **login**, backend issues:
   - `accessToken` (short-lived)
   - `refreshToken` (long-lived, stored in DB)
3. Tokens are set as **HTTP-only cookies** for security.
4. Users can **refresh** access tokens via `/refresh-token`.
5. Logout clears both cookies and invalidates refresh token.

---

## 🧠 Role-Based Access Control (RBAC)

| Role | Permissions |
|:-----|:-------------|
| **User** | View/update profile, change password, view books |
| **Admin** | Full access to all users and books, manage roles, and system data |

Example Middleware:
```js
export const authorizedRoles = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Unauthorized Access" });
  }
  next();
};
