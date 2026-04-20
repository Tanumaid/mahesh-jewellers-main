import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user?.isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default AdminRoute;