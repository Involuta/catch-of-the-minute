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
  useEffect(() => onAuthStateChanged(auth, setUser), []);
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
              <button onClick={login}>Sign in</button>
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
