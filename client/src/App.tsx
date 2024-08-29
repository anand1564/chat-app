
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import Signup from './components/Signup'
import {io} from 'socket.io-client'
import { useEffect } from 'react'
import Home from './components/Home'
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
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/signup" element={<Signup/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
