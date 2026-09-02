import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function DeckView() {
    const { deckId } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [term, setTerm] = useState('');
    const [definition, setDefinition] = useState('');
    const [editingCardId, setEditingCardId] = useState(null);
    const [editTerm, setEditTerm] = useState('');
    const [editDefinition, setEditDefinition] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [practice, setPractice] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);
    const [sessionStats, setSessionStats] = useState({ remembered: 0, missed: 0 });
    const [graded, setGraded] = useState(false);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jsonwebtoken')}`
    });

    function refreshCards() {
        return fetch(`/api/deck/${deckId}/card`, { headers: authHeaders() })
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (data) {
                    setCards(data);
                }
            });
    }

    useEffect(() => {
        if (!localStorage.getItem('jsonwebtoken')) {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        let mounted = true;

        async function loadDeck() {
            const [deckRes, cardsRes] = await Promise.all([
                fetch(`/api/deck/${deckId}`, { headers: authHeaders() }),
                fetch(`/api/deck/${deckId}/card`, { headers: authHeaders() })
            ]);

            if (!deckRes.ok) {
                navigate('/deck');
                return;
            }
            if (mounted) {
                setDeck(await deckRes.json());
                if (cardsRes.ok) {
                    setCards(await cardsRes.json());
                }
            }
        }
        loadDeck();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deckId]);

    async function handleAddCard() {
        if (!term.trim() && !definition.trim()) {
            return;
        }

        const res = await fetch(`/api/deck/${deckId}/card`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ term: term.trim(), definition: definition.trim() })
        });

        if (res.ok) {
            setTerm('');
            setDefinition('');
            await refreshCards();
        } else {
            setErrorMessage('Failed to add card');
        }
    }

    async function handleDeleteCard(cardId) {
        if (!window.confirm('Delete this flashcard?')) {
            return;
        }

        const res = await fetch(`/api/deck/${deckId}/card/${cardId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.ok) {
            if (editingCardId === cardId) {
                setEditingCardId(null);
            }
            await refreshCards();
        } else {
            setErrorMessage('Failed to delete card');
        }
    }

    async function handleDeleteDeck() {
        if (!window.confirm('Delete this deck and all of its flashcards?')) {
            return;
        }

        const res = await fetch(`/api/deck/${deckId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.ok) {
            navigate('/deck');
        } else {
            setErrorMessage('Failed to delete deck');
        }
    }

    function startEditing(card) {
        setEditingCardId(card.card_id);
        setEditTerm(card.term);
        setEditDefinition(card.definition);
    }

    async function saveEdit() {
        const res = await fetch(`/api/deck/${deckId}/card/${editingCardId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ term: editTerm.trim(), definition: editDefinition.trim() })
        });

        if (res.ok) {
            setEditingCardId(null);
            await refreshCards();
        } else {
            setErrorMessage('Failed to save card');
        }
    }

    function shuffle(order) {
        const shuffled = [...order];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function toCard(card) {
        return { card_id: card.card_id, term: card.term, definition: card.definition };
    }

    function beginSession(sessionCards, dueCount) {
        setQueue(shuffle(sessionCards));
        setCurrentIndex(0);
        setIsFlipped(false);
        setReviewedCount(dueCount);
        setSessionStats({ remembered: 0, missed: 0 });
        setGraded(false);
        setErrorMessage('');
        setPractice(true);
    }

    function startPractice() {
        if (cards.length === 0) {
            return;
        }
        fetch(`/api/deck/${deckId}/due`, { headers: authHeaders() })
            .then(res => (res.ok ? res.json() : null))
            .then(due => {
                if (due && due.length > 0) {
                    beginSession(due, due.length);
                } else {
                    beginSession(cards.map(toCard), 0);
                }
            })
            .catch(() => {
                beginSession(cards.map(toCard), 0);
            });
    }

    async function grade(quality) {
        const card = queue[currentIndex];
        if (!card || graded) {
            return;
        }
        setGraded(true);
        try {
            const res = await fetch(
                `/api/deck/${deckId}/card/${card.card_id}/review`,
                {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ quality })
                }
            );
            if (!res.ok) {
                throw new Error('review failed');
            }
            setSessionStats(stats => ({
                remembered: stats.remembered + (quality >= 3 ? 1 : 0),
                missed: stats.missed + (quality < 3 ? 1 : 0)
            }));
            setIsFlipped(false);
            setGraded(false);
            setCurrentIndex(index => index + 1);
        } catch {
            setErrorMessage('Failed to record review');
        } finally {
            setGraded(false);
        }
    }

    if (!deck) {
        return null;
    }

    const practiceCard = queue[currentIndex] || null;

    if (practice) {
        if (queue.length > 0 && currentIndex >= queue.length) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '450px',
                    margin: '0 auto',
                    padding: '20px'
                }}>
                    <h2>{deck.name}</h2>
                    <p>Review session complete.</p>
                    <p>
                        Remembered: {sessionStats.remembered} &middot;
                        Missed: {sessionStats.missed}
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                        {reviewedCount > 0
                            ? `${reviewedCount} card${reviewedCount === 1 ? '' : 's'} were due for spaced review. The rest were practiced without affecting your schedule.`
                            : 'Nothing was due for spaced review, so this session was practice only.'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={() => setPractice(false)}>Back</button>
                        <button onClick={startPractice}>Review Again</button>
                    </div>
                </div>
            );
        }

        if (!practiceCard) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '450px',
                    margin: '0 auto',
                    padding: '20px'
                }}>
                    <h2>{deck.name}</h2>
                    <p>This deck has no flashcards to practice with.</p>
                    <button onClick={() => setPractice(false)}>Back</button>
                </div>
            );
        }

        const gradeButtons = [
            { quality: 1, label: 'Again', missed: true },
            { quality: 3, label: 'Good' },
            { quality: 5, label: 'Easy' }
        ];

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
                    <h2 style={{ margin: 0 }}>{deck.name}</h2>
                    <button onClick={() => setPractice(false)}>Exit</button>
                </div>

                <p>{Math.min(currentIndex + 1, queue.length)} of {queue.length}</p>

                <div
                    onClick={() => setIsFlipped((flipped) => !flipped)}
                    style={{
                        width: '100%',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '24px',
                        margin: '10px 0',
                        cursor: 'pointer',
                        minHeight: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isFlipped ? (
                        <>
                            <p>{practiceCard.definition}</p>
                        </>
                    ) : (
                        <>
                            <p>{practiceCard.term}</p>
                        </>
                    )}
                </div>

                {isFlipped ? (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {gradeButtons.map(button => (
                            <button
                                key={button.quality}
                                onClick={() => grade(button.quality)}
                                disabled={graded}
                                style={button.missed ? { backgroundColor: 'var(--danger, #a33)', color: 'white' } : {}}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <>
                        <p>Click the card or Flip to reveal the answer</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button onClick={() => setIsFlipped((flipped) => !flipped)}>Flip</button>
                        </div>
                    </>
                )}
                {errorMessage && <p className="error-text">{errorMessage}</p>}
            </div>
        );
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
                <h2 style={{ margin: 0 }}>{deck.name}</h2>
                <button onClick={() => navigate('/deck')}>Back to Decks</button>
            </div>

            <p>Add or edit flashcards</p>
            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
                margin: '10px 0'
            }}>
                <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Term"
                />
                <textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Definition"
                    rows={2}
                />
                <button onClick={handleAddCard} style={{ alignSelf: 'flex-start' }}>Add Flashcard</button>
            </div>

            {cards.length === 0 ? (
                <p>This deck has no flashcards yet.</p>
            ) : (
                <>
                    <button onClick={startPractice} style={{ marginBottom: '10px' }}>Review Flashcards</button>
                    <ul style={{ width: '100%', padding: 0, listStyle: 'none', textAlign: 'left' }}>
                        {cards.map(card => (
                            <li
                                key={card.card_id}
                                style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    margin: '10px 0'
                                }}
                            >
                                {editingCardId === card.card_id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            value={editTerm}
                                            onChange={(e) => setEditTerm(e.target.value)}
                                            placeholder="Term"
                                        />
                                        <textarea
                                            value={editDefinition}
                                            onChange={(e) => setEditDefinition(e.target.value)}
                                            placeholder="Definition"
                                            rows={2}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={saveEdit}>Save</button>
                                            <button onClick={() => setEditingCardId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p><strong>{card.term}</strong></p>
                                        <p>{card.definition}</p>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button onClick={() => startEditing(card)}>Edit</button>
                                            <button onClick={() => handleDeleteCard(card.card_id)}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleDeleteDeck} style={{ marginTop: '10px' }}>Delete Deck</button>
                </>
            )}
        </div>
    );
}

export default DeckView
