

import { useState } from "react";
import API from "../services/api";

function Login({ onLogin, onShowSignup }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await API.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem("token", response.data.token);
            onLogin(response.data.user);
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Sweety</h1>
                <p>Welcome back! Login to track your glucose.</p>

                {error && <p className="error">{error}</p>}

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

                <p>
                    Don't have an account?{" "}
                    <span onClick={onShowSignup}>Sign up</span>
                </p>
            </form>
        </div>
    );
}

export default Login;
