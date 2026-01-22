import { useState, useEffect } from 'react';
import { Zap, ArrowRight, Star, Coins, Award, Trophy } from 'lucide-react';
import Header from '../components/Header';
import CoursesPage from './CoursesPage';

const initialUserData = {
  login: "...",
  progress: 0,
  currentCourse: "N/A",
  currentLesson: "N/A",
  courses: [],
  points: 0,
  coins: 0,
  rank: 15,
  latestActivity: null
};

const DashboardStatCard = ({ value, label, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border border-${color}-200 bg-${color}-50`}>
    <Icon className={`w-6 h-6 mx-auto mb-1 text-${color}-600`} />
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

const DashboardContentArea = ({ userData }) => {
  const latestActivity = userData.latestActivity;
  
  const formatTimeAgo = (isoString) => {
      if (!isoString) return "Brak ostatniej aktywności";
      const date = new Date(isoString);
      return date.toLocaleString();
  };

  return (
      <div className="space-y-8">
          <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Witaj {userData.login}!
              </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl shadow-xl text-white">
                      <p className="text-sm font-semibold mb-2 opacity-80">
                          Ostatnia aktywność: {latestActivity ? formatTimeAgo(latestActivity.lastUpdated) : "Nigdy"}
                      </p>
                      <h3 className="text-2xl font-bold mb-4">
                          {latestActivity ? 
                              `${latestActivity.courseTitle}: Lekcja ${latestActivity.completedLevelOrderIndex} ukończona` : 
                              "Zacznij swój pierwszy kurs!"
                          }
                      </h3>
                      <a 
                        href={latestActivity ? `/course/${latestActivity.courseId}` : '/courses'} 
                        className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-indigo-50 transition duration-150"
                      >
                          <span>{latestActivity ? 'Przejdź do następnej lekcji' : 'Zacznij kurs'}</span>
                          <ArrowRight className="w-5 h-5" />
                      </a>
                  </div>
              </div>
              
              <div className="lg:col-span-1 space-y-8">
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                          Twoje statystyki:
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <DashboardStatCard 
                                value={userData.coins}
                                label="Monety"
                                icon={Coins}
                                color='yellow'
                          />
                          <DashboardStatCard 
                              value={userData.points} 
                              label="Punkty" 
                              icon={Award} 
                              color="teal"
                          />
                          <DashboardStatCard 
                            value={userData.rank}
                            label="Ranking"
                            icon={Trophy}
                            color="blue"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};


export default function DashboardPage() { 
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userData, setUserData] = useState(initialUserData); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    
    if (!jwtToken) {
        setIsLoading(false);
        setError("Użytkownik niezalogowany. Przekierowanie do logowania...");
        
        setTimeout(() => {
            window.location.replace('/'); 
        }, 1500); 
        return;
    }

    const fetchLatestActivity = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/progress/latest-activity', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`, 
                },
            });
            
            if (response.ok) {
                const activityData = await response.json();
                
                if (activityData) {
                    setUserData(prevData => ({
                        ...prevData,
                        latestActivity: activityData,
                    }));
                }
            }
        } catch (err) {
            console.error("Błąd podczas pobierania ostatniej aktywności:", err);
        }
    };

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/user/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`, 
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          localStorage.removeItem('token');
          throw new Error('Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.');
        }

        const userDetails = await response.json();
        
        setUserData(prevData => ({
            ...prevData,
            login: userDetails.login,
            points: userDetails.points,
            coins: userDetails.coins,
            rank: userDetails.rank,
            courses: [
              { id: 1, title: "Python for Beginners", progress: 70, color: "blue", lessons: 20, hours: 15, status: 'In Progress' },
              { id: 2, title: "Modern JavaScript", progress: 45, color: "yellow", lessons: 30, hours: 25, status: 'In Progress' },
              { id: 4, title: "Introduction to HTML & CSS", progress: 100, color: "green", lessons: 10, hours: 5, status: 'Completed' },
            ]
        }));

        await fetchLatestActivity();
        
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Sesja wygasła')) {
            setTimeout(() => {
                window.location.replace('/'); 
            }, 3000); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const renderPage = () => {
    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Ładowanie panelu użytkownika...</div>;
    if (error) return <div className="text-center py-10 text-xl font-medium text-red-600">Błąd: {error}</div>;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardContentArea userData={userData} />;
      case 'courses':
        return <CoursesPage courses={userData.courses} />; 
      default:
        return <DashboardContentArea userData={userData} />;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="hidden">
        <span className="text-blue-600 bg-blue-500 border-blue-200 bg-blue-50 border-blue-300 bg-blue-100"></span>
        <span className="text-yellow-600 bg-yellow-500 border-yellow-200 bg-yellow-50 border-yellow-300 bg-yellow-100"></span>
        <span className="text-purple-600 bg-purple-500 border-purple-200 bg-purple-50 border-purple-300 bg-purple-100"></span>
        <span className="text-green-600 bg-green-500 border-green-200 bg-green-50 border-green-300 bg-green-100"></span>
        <span className="text-red-600 bg-red-500 border-red-200 bg-red-50 border-red-300 bg-red-100"></span>
        <span className="text-orange-600 bg-orange-500 border-orange-200 bg-orange-50 border-orange-300 bg-orange-100"></span>
        <span className="text-teal-600 bg-teal-500 border-teal-200 bg-teal-50 border-teal-300 bg-teal-100"></span>
        <span className="text-pink-600 bg-pink-500 border-pink-200 bg-pink-50 border-pink-300 bg-pink-100"></span>
        <span className="bg-indigo-600 hover:bg-indigo-700 bg-indigo-500 hover:bg-indigo-600 bg-gray-200 text-gray-700 hover:bg-gray-300"></span>
      </div>


      <Header
        currentPage={currentPage}
      />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}