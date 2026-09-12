import { useAuth } from "../auth/useAuth";

export function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;
  return (
    <div className="page">
      <h1>Welcome, {user.nickname}</h1>
      <p className="page-subtitle">Signed in as {user.role}. Replace this page with real feature work.</p>
    </div>
  );
}
