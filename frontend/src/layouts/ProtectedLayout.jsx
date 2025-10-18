import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader } from "lucide-react";

const ProtectedLayout = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      {/* renders the child routes */}
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
