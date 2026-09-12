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
            <Link to="/items" className="top-nav-link">
              Items
            </Link>
            <Link to="/comments" className="top-nav-link">
              Reviews
            </Link>
            <div className="bell-wrapper">
              <button type="button" className="bell-button" onClick={() => setBellOpen((v) => !v)}>
                🔔
                {unread > 0 && <span className="bell-badge">{unread}</span>}
              </button>
              {bellOpen && (
                <div className="dropdown notification-dropdown">
                  {items.length === 0 ? (
                    <p className="empty-state">Nothing yet.</p>
                  ) : (
                    items.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={n.read ? "notification-item" : "notification-item unread"}
                        onClick={() => {
                          markRead(n.id);
                          setBellOpen(false);
                          if (n.linkPath) navigate(n.linkPath);
                        }}
                      >
                        <strong>{n.title}</strong>
                        <span>{n.body}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="avatar-wrapper">
              <button type="button" className="avatar-button" onClick={() => setAvatarOpen((v) => !v)}>
                {user.nickname}
              </button>
              {avatarOpen && (
                <div className="dropdown avatar-dropdown">
                  <Link to="/profile" onClick={() => setAvatarOpen(false)}>
                    Profile settings
                  </Link>
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
