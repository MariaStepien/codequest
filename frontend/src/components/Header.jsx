import { useState } from 'react';
import { LogOut, BarChart3, BookOpenText, User } from 'lucide-react';

const navLinks = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { id: 'courses', name: 'Courses', icon: BookOpenText, href: '/courses' }
];

export default function Header({ userLogin, currentPage }) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.replace('/'); 
  };
  
  const getNavLinkClass = (linkId) => {
    return currentPage === linkId
      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-inner' 
      : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50';
  };


  return (
    <header className="sticky top-0 z-10 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        <a href="/dashboard" className="flex items-center space-x-2 cursor-pointer">
          <span className="text-xl font-extrabold text-gray-900">
            CodeQuest
          </span>
        </a>

        <nav className="hidden md:flex space-x-1">
          {navLinks.map(link => (
            <a 
              key={link.id}
              href={link.href}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out 
                ${getNavLinkClass(link.id)}
              `}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </a>
          ))}
        </nav>

        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-8 h-8 flex items-center justify-center text-black font-semibold text-sm">
              {userLogin}
            </div>
            <User className="w-4 h-4 text-gray-500 hidden sm:block" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20">
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}