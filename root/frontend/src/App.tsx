import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import { auth, login, logout, fn } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import COTMBanner from "./components/COTMBanner";
import Profile from "./components/Profile";
import ExchangePanel from "./components/ExchangePanel";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Rendering App, user:", user);

  return (
    <BrowserRouter>
      <div className="shell">
        <header>
          <Link to="/" className="brand">
            COTM
          </Link>
          <nav>
            <Link to="/">Home</Link>
            {user && <Link to="/profile">My Profile</Link>}
            {user && <Link to="/exchange">Exchange</Link>}
          </nav>
          <div className="auth">
            {!user ? (
              <button
                onClick={async () => {
                  console.log("Login button clicked!");
                  try {
                    await login();
                    console.log("Login function completed");
                  } catch (error) {
                    console.error("Error calling login:", error);
                  }
                }}
              >
                Sign in
              </button>
            ) : (
              <>
                <span className="user">{user.displayName}</span>
                <button onClick={logout}>Sign out</button>
              </>
            )}
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/exchange" element={<ExchangePanel user={user} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="container">
      <COTMBanner />
    </div>
  );
}
