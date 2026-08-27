import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import Signup from './Signup'
import Dashboard from './Dashboard'
import DeckView from './DeckView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/deck" element={<Dashboard />} />
        <Route path="/deck/:deckId" element={<DeckView />} />
      </Routes>
    </BrowserRouter> 
  )
}

export default App