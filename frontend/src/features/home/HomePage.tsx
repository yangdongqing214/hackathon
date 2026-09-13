import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function HomePage(): React.JSX.Element {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome to "the Charity fund manager app"</h1>
        <p className="page-subtitle">Please log in to continue.</p>
        <Link to="/login" className="primary-button">
          Log in
        </Link>
      </div>
    </div>
  );
}
