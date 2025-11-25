import { Outlet } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import { useSelector } from "react-redux";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Layout = () => {
  const { logout } = useAuth();
  const { user, isAuthenticated } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated && (
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <ApperIcon name="CheckSquare" className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">FlowTrack</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-slate-600">
                  Welcome, {user.firstName || user.emailAddress}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>
      )}
      <Outlet />
    </div>
  );
};

export default Layout;