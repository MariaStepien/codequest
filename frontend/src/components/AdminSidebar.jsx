import { useState } from 'react';
import { LogOut, LayoutDashboard, BookOpenText, ListPlus, Edit, User, Backpack, ArchiveRestore, PersonStanding, Skull, SkullIcon, MessageSquare, AlertCircle, User2 } from 'lucide-react';

const navLinks = [
  { id: 'admin-dashboard', name: 'Panel', icon: LayoutDashboard, href: '/admin-dashboard' },
  { id: 'admin-courses', name: 'Lista kursów', icon: BookOpenText, href: '/admin/courses' },
  { id: 'add-course', name: 'Dodaj kurs', icon: ListPlus, href: '/admin/create-course' },
  { id: 'add-lesson', name: 'Dodaj lekcję', icon: Edit, href: '/admin/create-lesson' },
  { id: 'admin-equipment-items', name: 'Lista przedmiotów', icon: Backpack, href: '/admin/equipment' },
  { id: 'add-equipment', name: 'Dodaj ekwipunek', icon: ArchiveRestore, href: '/admin/add-equipment'},
  { id: 'add-sprite', name: 'Dodaj sprite', icon: PersonStanding, href: '/admin/add-sprite'},
  { id: 'admin-enemies', name: 'Lista wrogów', icon: SkullIcon, href: '/admin/enemies'},
  { id: 'add-enemy', name: 'Dodaj wroga', icon: Skull, href: '/admin/add-enemy'},
  { id: 'forum', name: 'Forum', icon: MessageSquare, href: '/forum'},
  { id: 'user-list', name: 'Użytkownicy', icon: User2, href: '/admin/user-list'},
  { id: 'reports', name: 'Zgłoszenia', icon: AlertCircle, href: '/admin/reports'}
];

export default function AdminSidebar({ userLogin, currentPage }) { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role'); 
    window.location.replace('/');
  };
  
  const getNavLinkClass = (linkId) => {
    return currentPage === linkId
      ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600'
      : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50';
  };


  return (
    <aside className="fixed top-0 left-0 z-20 w-64 h-full bg-white shadow-xl flex flex-col transition-all duration-300 transform -translate-x-full md:translate-x-0">
      <div className="p-4 flex items-center justify-start h-16 border-b border-gray-100">
        <span className="text-xl font-extrabold text-indigo-700 tracking-wider">
          ADMIN PANEL
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(link => (
          <a 
            key={link.id}
            href={link.href}
            className={`
              flex items-center space-x-3 px-3 py-2 rounded-lg transition duration-150 ease-in-out text-base
              ${getNavLinkClass(link.id)}
            `}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="relative">
          <button 
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-indigo-50 transition duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-800 text-sm truncate">{userLogin}</span>
            </div>
          </button>

          {isMenuOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-xl py-1 z-30 border border-gray-100">
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span>Wyloguj</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}