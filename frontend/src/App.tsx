import { Routes, Route } from "react-router-dom";
import { TopNav } from "./shared/TopNav";
import { Footer } from "./shared/Footer";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { RequireAuth } from "./features/auth/RequireAuth";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { CharityDashboardPage } from "./features/dashboard/CharityDashboardPage";
import { ProfilePage } from "./features/user/ProfilePage";
import { HomePage } from "./features/home/HomePage";
import { ItemsListPage } from "./features/items/ItemsListPage";
import { CommentsPage } from "./features/comments/CommentsPage";

export default function App(): React.JSX.Element {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/charity-dashboard"
            element={
              <RequireAuth>
                <CharityDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/items"
            element={
              <RequireAuth>
                <ItemsListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/comments"
            element={
              <RequireAuth>
                <CommentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
