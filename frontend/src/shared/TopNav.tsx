import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function TopNav(): React.JSX.Element {
  const { user, logout } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <nav className="top-nav">
      <Link to="/" className="brand">
        <img src="/logo/hackathon_logo.jpg" alt="Charity platform home" className="brand-logo" />
      </Link>
      <div className="top-nav-right">
        {user ? (
          <>
            {user.role == "user" && (
              <Link to="/dashboard" className="top-nav-link">
              My allocation
            </Link>
            )}
            
            <Link to="/home" className="top-nav-link">
              Home
            </Link>
            {user.role == "charity" && (
              <Link to="/nonprofits" className="top-nav-link">
                Nonprofits
              </Link>
            )}
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
