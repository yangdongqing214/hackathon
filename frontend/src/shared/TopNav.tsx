import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useNotifications } from "../features/notification/useNotifications";

export function TopNav(): React.JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { items, unread, markRead } = useNotifications(Boolean(user));

  return (
    <nav className="top-nav">
      <Link to="/" className="brand">
        App
      </Link>
      <div className="top-nav-right">
        {user ? (
          <>
            <Link to="/home" className="top-nav-link">
              Home
            </Link>
            <Link to="/nonprofits" className="top-nav-link">
              Nonprofits
            </Link>
            <div className="avatar-wrapper">
              <button type="button" className="avatar-button" onClick={() => setAvatarOpen((v) => !v)}>
                {user.nickname}
              </button>
              {avatarOpen && (
                <div className="dropdown avatar-dropdown">
                  <Link to="/profile" onClick={() => setAvatarOpen(false)}>
                    Profile settings
                  </Link>
                  {(user.role === "nonprofit" || user.role === "charity") && (
                    <Link to="/nonprofits/me/edit" onClick={() => setAvatarOpen(false)}>
                      Manage my org
                    </Link>
                  )}
                  <button type="button" onClick={() => logout()}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register" className="primary-button">
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
