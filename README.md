# 🎮 Game Manager

> **A premium Full-Stack solution for video game catalog and collection management.**

This repository contains the complete source code for the Game Manager ecosystem, organized into two distinct applications:

---

## 📂 Project Structure

| Application  | Path                                | Description                                                 | Tech Stack                             |
| :----------- | :---------------------------------- | :---------------------------------------------------------- | :------------------------------------- |
| **Backend**  | [`/backend`](./backend/README.md)   | RESTful API, Database, Authentication, and Business Logic.  | Node.js, Express, MongoDB, TypeScript  |
| **Frontend** | [`/frontend`](./frontend/README.md) | Interactive User Interface, Dashboard, and Client-side app. | React, Vite, TypeScript, Glassmorphism |

---

## 🏗️ Architecture Overview

The system is designed as a decoupled client-server architecture:

```mermaid
graph LR
    User([👤 User]) <--> Client[🖥️ Frontend (React)]
    Client <--> API[⚙️ Backend (Express)]
    API <--> DB[(🗄️ MongoDB)]
    API <--> External[☁️ RAWG / Steam APIs]
```

---

## 🚀 How to Run

To run the full application locally, you need to start **both** the backend and frontend servers in separate terminal instances.

### 1. Start the Backend

Open your first terminal:

```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:3500
```

### 2. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
# App will open on http://localhost:5173
```

---

## 📄 Documentation

For deep dives into configuration, environment variables, and specific features, please refer to the documentation within each folder:

- **[Backend Documentation](./backend/README.md)**
- **[Frontend Documentation](./frontend/README.md)**

---

_Developed by AndyDev_
