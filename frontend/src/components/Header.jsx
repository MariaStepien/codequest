import { useState, useEffect } from 'react';
import { LogOut, BarChart3, BookOpenText, User, Backpack, Trophy, Award, MessageSquare, Heart, KeyRound } from 'lucide-react';
import HeartModal from './HeartModal';

const navLinks = [
  { id: 'dashboard', name: 'Panel', icon: BarChart3, href: '/dashboard' },
  { id: 'courses', name: 'Kursy', icon: BookOpenText, href: '/courses' },
  { id: 'equipment', name: 'Ekwipunek', icon: Backpack, href: '/user-equipment' },
  { id: 'trofies', name: 'Trofea', icon: Trophy, href: '/user-trophies' },
  { id: 'ranking', name: 'Ranking', icon: Award, href: '/ranking' },
  { id: 'forum', name: 'Forum', icon: MessageSquare, href: '/forum'}
];

/**
 * Reusable component for user navigation panel.
 * @param {object} currentPage
 */
export default function Header({ currentPage }) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [isHeartModalOpen, setIsHeartModalOpen] = useState(false);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFullUser(data);
      }
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika.");
      handleLogout();
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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

  const renderHearts = () => {
    const totalHearts = 5;
    const currentHearts = fullUser ? fullUser.hearts : 0;
    
    return (
      <button 
        onClick={() => setIsHeartModalOpen(true)}
        className="flex items-center space-x-1 mr-4 hover:bg-gray-100 p-1.5 rounded-lg transition-colors group"
        title="Kliknij, aby zarządzać sercami"
      >
        {[...Array(totalHearts)].map((_, index) => (
          <Heart 
            key={index}
            size={18}
            className={`transition-transform group-hover:scale-110 ${
              index < currentHearts 
                ? "fill-red-500 text-red-500" 
                : "fill-gray-300 text-gray-300"
            }`}
          />
        ))}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
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

        <div className="flex items-center">
          {renderHearts()}

          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition duration-150"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="px-2 flex items-center justify-center text-black font-semibold text-sm">
                {fullUser ? fullUser.login : "..."}
              </div>
              <User className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20">
                <a 
                  href="/change-password"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Zmień hasło</span>
                </a>
                <div className="border-t border-gray-100 my-1"></div>
                <a 
                  href="/"
                  onClick={(e) => { e.preventDefault(); handleLogout(); }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Wyloguj</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      {isHeartModalOpen && fullUser && (
        <HeartModal 
          user={fullUser} 
          onClose={() => setIsHeartModalOpen(false)} 
          onUpdate={fetchUserData} 
        />
      )}
    </header>
  );
}