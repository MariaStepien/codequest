import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboardContentArea = ({ userLogin }) => {

  return (
      <div className="space-y-10">
          <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Witaj {userLogin}
              </h2>
          </div>
        </div>
  );
};


export default function AdminDashboardPage() { 
  const [currentPage, setCurrentPage] = useState('admin-dashboard');
  const [userData, setUserData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userLogin = userData?.userLogin || "Admin";

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    
    if (!jwtToken) {
        setIsLoading(false);
        setError("Użytkownik nie zalogowany. Przenoszę do strony logowania...");
        
        setTimeout(() => {
            window.location.replace('/'); 
        }, 1500); 
        return;
    }

    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error("Autoryzacja nie udana lub sesja wygasła. Wylogowanie użytkownika...");
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role'); 
            window.location.replace('/');
            return;
          }
          
          throw new Error('Nie udało się pobrać danych użytkownika.');
        }

        const data = await response.json();
        setUserData(data); 
        setIsLoading(false);

      } catch (error) {
        console.error("Błąd pobrania danych użytkownika:", error);
      }
    };

    fetchAdminData();
  }, []);

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Loading Admin Dashboard...</div>;
    if (error) return <div className="text-center py-10 text-xl font-medium text-red-600">Error: {error}</div>;

    return <AdminDashboardContentArea userLogin={userLogin} />;
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* Hidden spans for Tailwind JIT compilation, similar to DashboardPage */}
      <div className="hidden">
        <span className="text-indigo-600 border-indigo-200 bg-red-500 border-red-200 bg-red-50 border-red-300 bg-red-100"></span>
        <span className="text-green-600 border-green-200"></span>
        <span className="text-yellow-600 border-yellow-200"></span>
      </div>

      <AdminSidebar
        userLogin={userLogin} 
        currentPage={currentPage}
      />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}