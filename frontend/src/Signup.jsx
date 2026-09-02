import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    async function handleSignup() {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password }),
        });

        if (res.ok === true) {
            navigate("/")
        } else {
            setErrorMessage('There was an error')
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
            <h2>Sign Up</h2>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            {errorMessage && <p className="error-text">{errorMessage}</p>}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px'
            }}>
                <button onClick={handleSignup}>Sign Up</button>
                <button onClick={() => navigate('/')}>Back to Login</button>
            </div>
        </div>
    );
}

export default Signup