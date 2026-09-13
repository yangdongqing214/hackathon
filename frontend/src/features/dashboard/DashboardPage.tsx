import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { Navigate } from "react-router-dom";

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;
<<<<<<< HEAD
  if (user.role === "charity") return <Navigate to="/charity-dashboard" replace />;
=======

  if (user.role === "nonprofit" || user.role === "charity") {
    return (
      <div className="page">
        <h1>Welcome, {user.nickname}</h1>
        <p className="page-subtitle">Publish your organization so donors can find you and add you to their giving plan.</p>
        <Link to="/nonprofits/me/edit" className="primary-button">
          Manage my org
        </Link>
      </div>
    );
  }

>>>>>>> bfa85f4 (fix: serve user-side giving demo from the logged-in dashboard)
  return (
    <iframe
      className="user-side-frame"
      title="Giving allocation"
      src="/user-side/index.html#step1"
    />
  );
}
