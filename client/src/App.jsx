

import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function App() {
    const [user, setUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
    };

    const handleSignup = async (email, password) => {
        try {
            const API = (await import("./services/api")).default;

            const response = await API.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            setUser(response.data.user);
        } catch (error) {
            setShowSignup(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    if (user) {
        return (
            <Dashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }

    return showSignup ? (
        <Signup
            onSignup={handleSignup}
            onShowLogin={() => setShowSignup(false)}
        />
    ) : (
        <Login
            onLogin={handleLogin}
            onShowSignup={() => setShowSignup(true)}
        />
    );
}

export default App;
