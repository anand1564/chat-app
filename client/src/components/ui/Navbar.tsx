import { Button } from "./button";
import { useAuth } from "@/context/authContext";
import { Avatar,AvatarImage,AvatarFallback } from "./avatar";
import { useNavigate } from "react-router-dom";
const Navbar = () =>{
    const navigate=useNavigate();
    const {isLoggedIn} = useAuth();
    return (
        <nav className="w-full bg-black flex justify-between items-end">
            <h1 className="text-green-700 text-2xl font-bold p-4">ChatApp</h1>
            <div className="mb-4 mr-4">
            <button className="mr-3 text-lg text-green-300 hover:text-green-100" onClick={()=>navigate('/chatRoom')}>Rooms</button>
            <button className="mr-3 text-lg text-green-300 hover:text-green-100" onClick={()=>navigate('/video-chat')}>Video chat</button>
            {isLoggedIn?<Avatar> <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback></Avatar>
            :<Button className="text-lg px-4 py-4 rounded-lg font-semibold " onClick={()=>navigate('/signup')}>Sign-up</Button>}
            </div>
        </nav>
    )
}
export default Navbar;
