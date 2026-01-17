import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboardContentArea = ({ userLogin, dailyReports, pendingReports }) => {

  return (
      <div className="space-y-10">
          <div className="p-6 bg-white rounded-xl shadow-md border-l-4 border-indigo-500"> 
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Witaj {userLogin}
              </h2>
              <p className="text-gray-500">Panel Administracyjny - Szybki Przegląd</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md border-t-4 border-red-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Dzisiejsze Zgłoszenia</h3>
              <p className="text-4xl font-black text-gray-900 mt-2">{dailyReports}</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md border-t-4 border-orange-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Nierozwiązane zgłoszenia</h3>
              <p className="text-4xl font-black text-gray-900 mt-2">{pendingReports}</p>
          </div>
          </div>   
        </div>
  );
};


export default function AdminDashboardPage() { 
  const [currentPage, setCurrentPage] = useState('admin-dashboard');
  const [userData, setUserData] = useState(null); 
  const [dailyReports, setDailyReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
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

    const fetchData = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          };

          const [userRes, reportRes, pendingRes] = await Promise.all([
            fetch('http://localhost:8080/api/user/me', { headers }),
            fetch('http://localhost:8080/api/reports/stats/daily-count', { headers }),
            fetch('http://localhost:8080/api/reports/stats/pending-count', { headers })
          ]);

          if (userRes.ok && reportRes.ok && pendingRes.ok) {
            const userData = await userRes.json();
            const reportCount = await reportRes.json();
            const pendingCount = await pendingRes.json();
            setUserData(userData);
            setDailyReports(reportCount);
            setPendingReports(pendingCount);
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Błąd pobrania danych:", error);
          setError("Błąd ładowania danych.");
        }
      };

      fetchData();
    }, []);

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Loading Admin Dashboard...</div>;
    if (error) return <div className="text-center py-10 text-xl font-medium text-red-600">Error: {error}</div>;

    return <AdminDashboardContentArea userLogin={userLogin} dailyReports={dailyReports} pendingReports={pendingReports} />;
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="hidden">
        <span className="text-indigo-600 border-indigo-200 bg-red-500 border-red-200 bg-red-50 border-red-300 bg-red-100"></span>
        <span className="text-green-600 border-green-200"></span>
        <span className="text-yellow-600 border-yellow-200"></span>
      </div>

      <AdminSidebar
        userLogin={userLogin} 
        currentPage={currentPage}
      />
      
      <main className="md:ml-64"> 
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Panel Administratora</h1> 
            {renderContent()}
        </div>
      </main>
    </div>
  );
}