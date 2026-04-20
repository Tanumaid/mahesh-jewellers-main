import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = () => {
  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;