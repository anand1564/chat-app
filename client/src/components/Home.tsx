
import { Users, Video, Zap, Shield, Globe, MessageSquare } from 'lucide-react';
import Navbar from './ui/Navbar';
const Home = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(55 65 81) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      <Navbar />

      {/* Hero Section */}
      <div className="relative">
        <div className="container mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connect Instantly with Anyone, Anywhere
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience seamless communication with our feature-rich chat platform that brings people together.
          </p>
          
          {/* Hero Image/Video Container */}
          <div className="max-w-4xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/api/placeholder/800/500"
              alt="Chat App Demo"
              className="w-full h-auto"
            />
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors">
            Get Started Free
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 text-white dark:bg-gray-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto">
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Users className="h-12 w-12 text-blue-500" />
              <h3 className="text-xl font-bold">Group Chats</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Create and manage multiple group conversations with ease.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Video className="h-12 w-12 text-green-500" />
              <h3 className="text-xl font-bold">Video Calls</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                High-quality video conferencing for face-to-face interactions.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Zap className="h-12 w-12 text-yellow-500" />
              <h3 className="text-xl font-bold">Real-Time Messaging</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Instant message delivery for seamless conversations.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Shield className="h-12 w-12 text-red-500" />
              <h3 className="text-xl font-bold">Secure Encryption</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                End-to-end encryption for all your messages and calls.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Globe className="h-12 w-12 text-purple-500" />
              <h3 className="text-xl font-bold">Cross-Platform</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Available on web, mobile, and desktop for seamless access.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <MessageSquare className="h-12 w-12 text-indigo-500" />
              <h3 className="text-xl font-bold">Rich Media Sharing</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Easily share photos, videos, and files within your chats.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;