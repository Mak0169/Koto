import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    /**
     *  Using useState to create a state variable
     *  store user's email and password. default is
     *  set to ('') but when its updated it will change.
     */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleLogin() {
        const res = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password }),
        });

        const result = await res.json()
        if (res.ok === true) {
            localStorage.setItem('jsonwebtoken', result.access_token);
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '25vh'
        }}>
            <h2>Login</h2>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px'
            }}>
                <button onClick={handleLogin}>Login</button>
                <button onClick={() => navigate('/signup')}>Signup</button>
            </div>
        </div>
    );
}

export default Login