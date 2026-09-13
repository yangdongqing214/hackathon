import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const [params] = useSearchParams();
  if (!user) return <></>;
  if (user.role === "charity") return <Navigate to="/charity-dashboard" replace />;

  const step = params.get("step") === "2" ? "step2" : params.get("step") === "3" ? "step3" : "step1";

  return (
    <iframe
      className="user-side-frame"
      title="Giving allocation"
      src={`/user-side/index.html#${step}`}
    />
  );
}
