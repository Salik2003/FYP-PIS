Awesome, Yasir! Since your NestJS backend is now fully working with:

* ✅ JWT-based registration & login
* ✅ PostgreSQL database via Prisma
* ✅ Secure password hashing
* ✅ User data stored in `toolbox_engine` schema
* ✅ Working `POST /api/login` endpoints
* ✅ Swagger (OpenAPI) is running at `/swagger` endpoint

Here’s a clean and professional `README.md` for your project:

---

## 📦 toolbox-engine-be

A secure NestJS backend API with JWT authentication and PostgreSQL integration using Prisma ORM.

---

## 🚀 Features

* ✅ User **Login** with JWT token generation
* ✅ All credentials stored in **PostgreSQL** (`toolbox_engine` schema)
* ✅ Prisma ORM setup with `User` model
* ✅ Protected route example: `GET /api/protected`
* ✅ Clean modular structure using NestJS best practices
* ✅ OpenAPI implementation (Swagger) : `/swagger`

---

## 🛠️ Tech Stack

* **NestJS** — scalable Node.js framework
* **Prisma ORM** — type-safe PostgreSQL access
* **PostgreSQL** — cloud-hosted RDS database
* **JWT** — stateless authentication
* **bcrypt** — password hashing
* **Swagger** - API documentation & testing

---

## 📁 Endpoints

| Method | Endpoint                        | Auth Required | Description             |
| ------ | ------------------------------- | ------------- | ----------------------- |
| POST   | `/api/login`     | ❌ No          | Login and get JWT token |
| GET    | `/api/protected` | ✅ Yes         | Example protected route |

---

## 🧪 How to Use

### 1. 📦 Install dependencies

```bash
npm install
```

### 2. 🔐 Set up `.env`

```env
DATABASE_URL="postgresql://<user>:<encoded_password>@<host>:5432/<db>?schema=toolbox_engine"
JWT_SECRET=supersecretjwt
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

✅ Encode special characters in the password using [https://www.urlencoder.io/](https://www.urlencoder.io/).

---

### 3. 🔁 Push Prisma schema

```bash
npx prisma db push
```

Optional: Launch Prisma Studio GUI:

```bash
npx prisma studio
```

---

### 4. 🚀 Start the server

```bash
npm run start
```

---

### 5. 🧪 Test in Postman

#### 🔹 Login

```
POST http://localhost:3000/api/login
```

Returns:

```json
{
  "access_token": "..."
}
```

Use the token in:

```
Authorization: Bearer <token>
```

---

## ✅ Folder Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
├── protected/
│   └── protected.controller.ts
├── app.module.ts
└── main.ts
```

---

## 👨‍💻 Author

**Yasir Irfan**
Backend Developer | Full-Stack Engineer | PostgreSQL + NestJS Specialist

---
