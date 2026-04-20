import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const AdminRoute = ({ children }: any) => {

  // 🔥 USE CONTEXT (IMPORTANT FIX)
  const { user } = useContext(CartContext)!;

  // 🔒 Not logged in OR not admin
  if (!user || !user.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;