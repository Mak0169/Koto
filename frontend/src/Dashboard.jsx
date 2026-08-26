import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [decks, setDecks] = useState([]);
    const [newDeckName, setNewDeckName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('jsonwebtoken')) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        let mounted = true;

        async function fetchDecks() {
            const res = await fetch('/api/deck', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jsonwebtoken')}`
                }
            });

            if (!res.ok) {
                throw new Error("Something bad happened");
            }
            const result = await res.json();

            if (mounted) {
                setDecks(result);
            }
        }
        fetchDecks();

        return () => {
            mounted = false;
        };
    }, []);

    async function handleCreateDeck() {
        const name = newDeckName.trim();
        if (!name) {
            return;
        }

        const res = await fetch('/api/deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jsonwebtoken')}`
            },
            body: JSON.stringify({ name })
        });

        if (res.ok) {
            setNewDeckName('');
            const result = await fetch('/api/deck', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jsonwebtoken')}`
                }
            });
            if (result.ok) {
                setDecks(await result.json());
            }
        } else {
            setErrorMessage('Failed to create deck');
        }
    }

    function handleLogout() {
        localStorage.removeItem('jsonwebtoken');
        navigate('/');
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '450px',
            margin: '0 auto',
            padding: '20px'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: '10px'
            }}>
                <h2>My Decks</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div style={{
                display: 'flex',
                gap: '10px',
                width: '100%',
                marginBottom: '10px'
            }}>
                <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="New deck name"
                    style={{ flex: 1 }}
                />
                <button onClick={handleCreateDeck}>Add Deck</button>
            </div>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            {decks.length === 0 ? (
                <p>You have no decks yet. Add one above!</p>
            ) : (
                <ul style={{ width: '100%', padding: 0, listStyle: 'none', textAlign: 'left' }}>
                    {decks.map(deck => (
                        <li key={deck.deck_id} onClick={() => navigate('/deck', { state: { deck } })}
                            style={{
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '12px',
                                margin: '10px 0',
                                cursor: 'pointer'
                            }}>
                            {deck.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Dashboard
