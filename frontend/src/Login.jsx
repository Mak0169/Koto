import { useState } from 'react';

function Login() {
    /**
     *  Using useState to create a state variable
     *  store user's email and password. default is
     *  set to ('') but when its updated it will change.
     */
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function handleLogin() {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password }),
        });
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /> <br />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login