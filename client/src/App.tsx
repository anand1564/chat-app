
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import Home from './components/Home'
import { AuthProvider } from './context/authContext'
import Login from './components/login'
import ChatRoom from './components/ChatRoom'
import VideoChat from './components/VideoChat'
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/chatRoom/:id" element={<ChatRoom/>} />
      <Route path="/videoChat" element={<VideoChat roomId='1'/>} />
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
