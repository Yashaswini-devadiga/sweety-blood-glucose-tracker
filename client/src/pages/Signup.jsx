

import { useState } from "react";
import API from "../services/api";

function Signup({ onSignup, onShowLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await API.post("/auth/signup", {
                name,
                email,
                password
            });

            onSignup(email, password);
        } catch (err) {
            setError(
                err.response?.data?.message || "Signup failed. Please try again."
            );
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Create Account</h1>
                <p>Start tracking your blood glucose with Sweety.</p>

                {error && <p className="error">{error}</p>}

                <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password (minimum 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                />

                <button type="submit">Create Account</button>

                <p>
                    Already have an account?{" "}
                    <span onClick={onShowLogin}>Login</span>
                </p>
            </form>
        </div>
    );
}

export default Signup;
