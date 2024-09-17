
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import Home from './components/Home'
import { AuthProvider } from './context/authContext'
import Login from './components/login'
import ChatRoom from './components/ChatRoom'
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/chatRoom/:id" element={<ChatRoom/>} />
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
