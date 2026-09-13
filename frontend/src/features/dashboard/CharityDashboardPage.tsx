import { useAuth } from "../auth/useAuth";

export function CharityDashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;

  return (
    <div className="page">
      <h1>Charity Dashboard</h1>
      <p className="page-subtitle">Welcome, {user.nickname}. Charity features will go here.</p>
    </div>
  );
}
