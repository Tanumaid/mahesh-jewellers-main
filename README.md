# Mahesh Jewellers Web App

A full-stack e-commerce and catalog web application built for Mahesh Jewellers. It features a complete product catalog, category/subcategory filtering, live gold rate calculations, shopping cart, wishlist, and an admin dashboard for inventory management.

## 🚀 Tech Stack

- **Frontend:** React (Vite), TypeScript, Context API, CSS (Custom Design)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **API Communication:** Axios

---

## 🛠️ Prerequisites & Required Software

Before you begin, ensure you have the following installed on your machine:
1. **[Node.js](https://nodejs.org/)** (v16.x or higher recommended)
2. **[MongoDB](https://www.mongodb.com/try/download/community)** (Running locally or a MongoDB Atlas URI)
3. **[Git](https://git-scm.com/)** (Optional, for version control)

---

## 📁 Project Structure

The repository is divided into two main parts: `frontend` and `backend`.

```text
mahesh-jewellers-main/
├── backend/                  # Node.js + Express backend
│   ├── config/               # Configuration files (e.g., DB connection)
│   ├── models/               # Mongoose schemas (Product, User, Order, etc.)
│   ├── routes/               # Express API routes
│   ├── server.js             # Entry point for the backend server
│   ├── package.json          # Backend dependencies
│   └── .env                  # Backend environment variables
│
├── frontend/                 # React + TypeScript frontend (Vite)
│   ├── public/               # Static public assets
│   ├── src/                  # React source code
│   │   ├── assets/           # Images, icons, global styles
│   │   ├── components/       # Reusable UI components (Filters, Cards, Navbar)
│   │   ├── context/          # React Context (Cart, Auth, etc.)
│   │   ├── pages/            # Page-level components (Home, Products, Admin)
│   │   ├── types/            # TypeScript interface definitions
│   │   ├── App.tsx           # Main application routing
│   │   └── main.tsx          # React DOM mounting point
│   ├── vite.config.ts        # Vite configuration
│   └── package.json          # Frontend dependencies
└── README.md                 # Project documentation
```

---

## ⚙️ Environment Setup

Before running the project, you must set up the environment variables for the backend.

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create or update the `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mahesh_jewellers
   # Add any other required keys like JWT_SECRET if applicable
   ```
   *(Note: Ensure your MongoDB server is running locally if you are using `localhost`.)*

---

## 🏃‍♂️ How to Run the Project

You will need to start both the **Backend API** and the **Frontend React App** in separate terminal windows.

### Step 1: Start the Backend Server
Open a terminal and run the following commands:
```bash
# Navigate to the backend directory
cd backend

# Install all backend dependencies
npm install

# Start the Express server
npm start
```
*The backend should now be running on `http://localhost:5000`.*

### Step 2: Start the Frontend Application
Open a **new, separate** terminal window and run the following commands:
```bash
# Navigate to the frontend directory (from the root folder)
cd frontend

# Install all frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend should now be running, typically on `http://localhost:5173`. Open this URL in your browser to view the application.*

---

## 🌟 Key Features

- **Dynamic Catalog:** Filter products smoothly by Gold, Silver, and Temple Jewellery categories and subcategories.
- **Admin Dashboard:** Add, edit, and delete products easily with enforced categories and calculated attributes.
- **Cart & Wishlist:** Manage shopping items effortlessly.
- **Live Gold Rates:** Real-time pricing calculations based on purity, weight, current gold rates, and GST.
