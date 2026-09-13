import { useAuth } from "../auth/useAuth";
import { Navigate } from "react-router-dom";

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;
  if (user.role === "charity") return <Navigate to="/charity-dashboard" replace />;
  return (
    <div className="page">
      <h1>Welcome, {user.nickname}, {user.role}</h1>
      <p className="page-subtitle">Signed in as {user.role}. Replace this page with real feature work.</p>
    </div>
  );
}
