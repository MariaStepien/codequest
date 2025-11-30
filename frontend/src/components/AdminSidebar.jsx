import { useState } from 'react';
import { LogOut, LayoutDashboard, BookOpenText, ListPlus, Edit, User } from 'lucide-react';

const navLinks = [
  { id: 'admin-dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/admin-dashboard' },
  { id: 'admin-courses', name: 'List Courses', icon: BookOpenText, href: '/admin/courses' },
  { id: 'add-course', name: 'Add Course', icon: ListPlus, href: '/admin/create-course' },
  { id: 'edit-lesson', name: 'Add/Edit Lesson', icon: Edit, href: '/admin/lessons/edit' }
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
      ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600' 
      : 'text-gray-600 hover:text-blue-700 hover:bg-gray-100';
  };


  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-white shadow-xl flex flex-col z-20">
      <div className="p-6">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center">
          <span className="text-blue-600 mr-1">Admin</span>
        </h1>
      </div>

      <nav className="flex-grow space-y-2 px-4 py-4">
        {navLinks.map(link => (
          <a 
            key={link.id}
            href={link.href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition duration-150 ease-in-out text-base
              ${getNavLinkClass(link.id)}
            `}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <button 
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-800 text-sm truncate">{userLogin}</span>
            </div>
            {/* Simple Menu Icon - hidden by default unless you implement mobile/collapse logic */}
          </button>

          {isMenuOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-xl py-1 z-30 border border-gray-100">
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
    </aside>
  );
}