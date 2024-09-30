import { Button } from "./button";
import { useAuth } from "@/context/authContext";
import { Avatar,AvatarImage,AvatarFallback } from "./avatar";
import { useNavigate } from "react-router-dom";
const Navbar = () =>{
    const navigate=useNavigate();
    const {isLoggedIn} = useAuth();
    return (
        <nav className="w-full bg-gray-700 flex justify-between items-end">
            <h1 className="text-white text-2xl font-bold p-4">ChatApp</h1>
            <div className="mb-4 mr-4">
            {isLoggedIn?<Avatar> <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback></Avatar>
            :<Button className="text-lg px-4 py-4 rounded-lg font-semibold " onClick={()=>navigate('/signup')}>Sign-up</Button>}
            </div>
        </nav>
    )
}
export default Navbar;