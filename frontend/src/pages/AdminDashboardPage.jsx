import { useState, useEffect } from 'react';
import Header from '../components/Header';
import AdminSidebar from '../components/AdminSidebar';

const initialAdminData = {
  totalUsers: 0,
  activeCourses: 0,
  pendingIssues: 0,
  serverStatus: 'Loading...',
  latestAdminActivity: null
};

const AdminDashboardContentArea = ({ adminData, userLogin }) => {

  return (
      <div className="space-y-10">
          <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-red-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome {userLogin}
              </h2>
          </div>
        </div>
  );
};


export default function AdminDashboardPage() { 
  const [currentPage, setCurrentPage] = useState('admin-dashboard');
  const [adminData, setAdminData] = useState(initialAdminData); 
  const [userLogin, setUserLogin] = useState("Admin");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    // NOTE: You would typically perform an additional check here 
    // to ensure the user's role in localStorage is 'ADMIN' before fetching.
    
    if (!jwtToken) {
        setIsLoading(false);
        setError("Not authenticated. Redirecting to login...");
        setTimeout(() => {
            window.location.replace('/'); 
        }, 1500); 
        return;
    }

    const fetchAdminData = async () => {
      try {
        // Hypothetical endpoint for admin statistics
        const response = await fetch('http://localhost:8080/api/admin/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`, 
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) {
            throw new Error('Access Denied. You do not have administrator privileges.');
        }

        if (!response.ok) {
          localStorage.removeItem('token');
          throw new Error('Session expired or invalid. Please log in again.');
        }

        // Mock data for demonstration
        // Replace this with the actual API response data: const stats = await response.json();
        const stats = {
            totalUsers: 4520,
            activeCourses: 24,
            pendingIssues: 7,
            serverStatus: 'Operational',
            latestAdminActivity: {
                title: "New course 'React Fundamentals' published.",
                timestamp: new Date().toISOString()
            },
        };

        const storedUserLogin = localStorage.getItem('userLogin') || "Admin"; // Assume userLogin is stored upon login
        
        setAdminData(stats);
        setUserLogin(storedUserLogin);
        
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(err.message);
        
        if (err.message.includes('Session expired') || err.message.includes('Access Denied')) {
            setTimeout(() => {
                window.location.replace('/'); 
            }, 3000); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Loading Admin Dashboard...</div>;
    if (error) return <div className="text-center py-10 text-xl font-medium text-red-600">Error: {error}</div>;

    return <AdminDashboardContentArea adminData={adminData} userLogin={userLogin} />;
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
        // You might want a different set of links for the Admin header
      />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}