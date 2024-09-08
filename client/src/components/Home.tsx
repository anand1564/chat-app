import { BackgroundLines } from "./ui/background-lines";
import Signup from "./Signup";
import { useAuth } from "../context/authContext";

const Home = () => {
    const { isLoggedIn } = useAuth();

    return (
        <div className="relative min-h-screen bg-gray-900 text-white">
            {/* Background lines */}
            <BackgroundLines className="absolute inset-0 z-0 opacity-50" >
                {null}
            </BackgroundLines>

            {isLoggedIn ? (
                <div className="relative z-10 p-5">
                    <h1 className="text-center mx-auto font-bold text-2xl bg-slate-800 p-5 text-white">
                        Welcome to Chat Rooms
                    </h1>
                    <h2 className="text-2xl font-semibold mt-4">Create a Chat Room</h2>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">
                        Create
                    </button>

                    <h2 className="text-2xl font-semibold mt-6">Join a Chat Room</h2>
                    <div className="mt-2">
                        {/* Chat room join options can be added here */}
                    </div>
                </div>
            ) : (
                <div className="relative z-10 p-5">
                    <Signup />
                </div>
            )}
        </div>
    );
};

export default Home;
