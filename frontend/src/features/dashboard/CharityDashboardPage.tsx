import { useAuth } from "../auth/useAuth";

export function CharityDashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  if (!user) return <></>;
  return (
    <div className="page">
      <h1>Welcome, {user.nickname}, {user.role}</h1>
      <p className="page-subtitle">Signed in as {user.role}. Landing page for charities!</p>
    </div>
  );
}
