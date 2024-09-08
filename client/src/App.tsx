
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import {io} from 'socket.io-client'
import { useEffect } from 'react'
import Home from './components/Home'
import { AuthProvider } from './context/authContext'
import Login from './components/login'
function App() {
const socket=io('http://localhost:3000')
useEffect(()=>{
socket.on('connect',()=>{
  console.log("A user connected");
});
socket.on('disconnect',()=>{
  console.log("A user disconnected");
})
return ()=>{
  socket.disconnect();
}
},[]);
  return (
    <AuthProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
