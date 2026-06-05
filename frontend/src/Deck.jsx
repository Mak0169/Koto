import { useState, useEffect } from 'react';

function Deck() {
    const [decks, setDecks] = useState([]);

    useEffect(() => {
        let mounted = true;

        async function fetchDeck() {
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
    fetchDeck();
    
    return () => {
        mounted = false;
    };
    }, []);
    
    return (
        <div>
            {decks.map(deck => (
                <li key={deck.deck_id}>{deck.name}</li>
            ))}
        </div>
    );
}

export default Deck