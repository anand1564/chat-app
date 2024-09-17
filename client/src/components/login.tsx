import { useState } from "react";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setIsLoggedIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/users/login", formData);
      if (response.status === 200) {
        setIsLoggedIn(true);
        navigate('/');
      } else {
        alert("Login failed: " + response.statusText);
      }
    } catch (error: any) {
      // Checking if the error has a response and providing detailed feedback
      if (error.response) {
        console.log(error.response.data);
        alert(`Login Failed: ${error.response.data.message || "An error occurred"}`);
      } else {
        console.log(error.message);
        alert("Login Failed: An error occurred");
      }
    }
  };  

  return (
    <div className="flex justify-center min-h-screen items-center bg-slate-900">
      <div className="bg-white w-full rounded-lg shadow-md max-w-md p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              onChange={handleChange}
              value={formData.password}
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
