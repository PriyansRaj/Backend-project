# 🛍️ E-Commerce Backend API

A powerful and modular **Node.js + Express** backend for an e-commerce platform, featuring **JWT authentication**, **social login (Google & GitHub)**, **product management**, **cart operations**, and **order handling** — all built with scalability and clean architecture in mind.

---

## 🚀 Features

### 🧑‍💻 Authentication

- User registration & login with email/password
- JWT-based session management
- Google OAuth login (via Passport.js)
- GitHub OAuth login (via Passport.js)
- Secure password hashing using bcrypt
- Role-based access (Admin, User)

### 🛒 Cart Management

- Add, update, or remove items from cart
- View current cart
- Clear entire cart

### 📦 Product Management

- Add, edit, delete, and view products
- Search products by name or brand
- Filter products by price, category, or stock availability
- Sort products by price or discount
- Supports pagination for large product lists

### 📑 Orders

- Place new orders
- View user orders
- Change order status (Admin only)
- Track order history

---

## 🧩 Tech Stack

| Layer                      | Technology                         |
| -------------------------- | ---------------------------------- |
| **Backend Framework**      | Node.js, Express.js                |
| **Database**               | MongoDB (Mongoose ORM)             |
| **Authentication**         | JWT, Passport.js (Google & GitHub) |
| **Error Handling**         | Custom APIError & Response classes |
| **Environment Management** | dotenv                             |
| **Validation**             | Joi / Built-in Mongoose validation |
| **Others**                 | bcrypt, cookie-parser, cors        |

---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone git@github.com:PriyansRaj/Backend-project.git
cd ecommerce-backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 4️⃣ Run the Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints Overview

| Module       | Method   | Endpoint                         | Description                                       |
| ------------ | -------- | -------------------------------- | ------------------------------------------------- |
| **Auth**     | `POST`   | `/api/v1/user/register`          | Register new user                                 |
|              | `POST`   | `/api/v1/user/login`             | Login with email/password                         |
|              | `GET`    | `/api/v1/user/google`            | Google login                                      |
|              | `GET`    | `/api/v1/user/github`            | GitHub login                                      |
| **Products** | `GET`    | `/api/v1/products`               | Get all products (search, filter, sort supported) |
|              | `POST`   | `/api/v1/products`               | Add new product                                   |
|              | `PUT`    | `/api/v1/products/:id`           | Update product                                    |
|              | `DELETE` | `/api/v1/products/:id`           | Delete product                                    |
| **Cart**     | `GET`    | `/api/v1/cart`                   | View user cart                                    |
|              | `POST`   | `/api/v1/cart/add/:productId`    | Add product to cart                               |
|              | `DELETE` | `/api/v1/cart/clear`             | Clear cart                                        |
| **Orders**   | `POST`   | `/api/v1/order/:productName`     | Place order                                       |
|              | `PUT`    | `/api/v1/order/status/:username` | Update order status                               |

---

## 🧱 Folder Structure

```
📦 ecommerce-backend
├── 📁 config
│   ├── db.js
│   └── passport.js
├── 📁 controllers
│   ├── user.controller.js
│   ├── product.controller.js
│   ├── cart.controller.js
│   └── order.controller.js
├── 📁 middlewares
│   ├── auth.middleware.js
│   └── error.middleware.js
├── 📁 models
│   ├── User.model.js
│   ├── Product.model.js
│   ├── Cart.model.js
│   └── Order.model.js
├── 📁 routes
│   ├── user.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   └── order.routes.js
├── 📁 utils
│   ├── ApiError.js
│   └── Response.js
├── server.js
└── .env
```

---

## 🧪 Future Enhancements

- 🏦 Payment integration (Stripe / Razorpay)
- 📈 Admin dashboard (React + Chart.js)
- 📬 Email notifications for order updates
- 📱 Mobile app backend (via same API)
- 🌍 Multi-language support

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the **MIT License**.
