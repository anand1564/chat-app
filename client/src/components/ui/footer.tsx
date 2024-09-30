
import { Github, Linkedin, X, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-5">
          {/* Social Media Links */}
          <div className="w-full flex flex-col text-center">
            <h3 className="text-lg font-semibold mb-4">Made by Anand Pandey. Connect With Me</h3>
            <div className="flex justify-center gap-3">
              <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Github size={24} />
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <Linkedin size={24} />
              </a>
              <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">
                <X size={24} />
              </a>
              <a href="mailto:your.email@example.com" className="hover:text-gray-300 transition-colors">
                <Mail size={24} />
              </a>
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="w-full text-center mt-5">
            <p>&copy; {currentYear} Anand Pandey. All rights reserved.</p>
          </div>
    </footer>
  );
};

export default Footer;