import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;
  if (user.role === "charity") return <Navigate to="/charity-dashboard" replace />;

  return (
    <iframe
      className="user-side-frame"
      title="Giving allocation"
      src="/user-side/index.html#step1"
    />
  );
}
