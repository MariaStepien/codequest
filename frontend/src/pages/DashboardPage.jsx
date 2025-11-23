import { useState, useEffect } from 'react';
import { LogOut, Settings, BarChart3, BookOpenText, User, Sun, Zap, Award, ArrowRight } from 'lucide-react';
import CoursesPage from './CoursesPage';

// Initial state for user data before successful fetch
const initialUserData = {
  userLogin: "Guest",
  progress: 0,
  currentCourse: "N/A",
  currentLesson: "N/A",
  courses: [],
  streak: 0,
  xp: 0,
  badges: 0,
  latestActivity: null
};

const ProgressBar = ({ progress, color, title }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm font-medium mb-1">
      <span className="text-gray-700">{title}</span>
      <span className={`text-${color}-600`}>{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full bg-${color}-500 transition-all duration-700`} 
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const StatCard = ({ value, label, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border border-${color}-200 bg-${color}-50`}>
    <Icon className={`w-6 h-6 mx-auto mb-1 text-${color}-600`} />
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);


const DashboardContent = ({ userData, handleNavigation }) => {
  const latestActivity = userData.latestActivity;
  
  // Helper to format the time
  const formatTimeAgo = (isoString) => {
      if (!isoString) return "No recent activity";
      const date = new Date(isoString);
      return date.toLocaleString();
  };

  return (
      <div className="space-y-8">
          <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {userData.userLogin}
              </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl shadow-xl text-white">
                      <p className="text-sm font-semibold mb-2 opacity-80">
                          LATEST ACTIVITY: {latestActivity ? formatTimeAgo(latestActivity.lastUpdated) : "Never"}
                      </p>
                      <h3 className="text-2xl font-bold mb-4">
                          {latestActivity ? 
                              `${latestActivity.courseTitle}: Level ${latestActivity.completedLevelOrderIndex} completed` : 
                              "Start your first course!"
                          }
                      </h3>
                      <a 
                        href={latestActivity ? `/course/${latestActivity.courseId}` : '/courses'} 
                        className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-indigo-50 transition duration-150"
                      >
                          <span>{latestActivity ? 'Go to Next Level' : 'Start a Course'}</span>
                          <ArrowRight className="w-5 h-5" />
                      </a>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Your Course Progress
                        </h3>
                        <button 
                          onClick={() => handleNavigation('courses')}
                          className="bg-blue text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          View All Courses &rarr;
                        </button>
                      </div>

                      <div className="space-y-4">
                          {userData.courses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 3).map(course => (
                              <ProgressBar 
                                  key={course.id}
                                  title={course.title} 
                                  progress={course.progress} 
                                  color={course.color} 
                              />
                          ))}
                      </div>
                  </div>
                  
              </div>
              
              <div className="lg:col-span-1 space-y-8">
                  
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                          Gamification Stats
                      </h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                          <StatCard 
                              value={userData.streak} 
                              label="Day Streak" 
                              icon={Sun} 
                              color="orange"
                          />
                          <StatCard 
                              value={userData.xp} 
                              label="Total XP" 
                              icon={Zap} 
                              color="teal"
                          />
                          <StatCard 
                              value={userData.badges} 
                              label="Badges Earned" 
                              icon={Award} 
                              color="pink"
                          />
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};


const navLinks = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'courses', name: 'Courses', icon: BookOpenText }
];

export default function DashboardPage() { 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard'); 
  const [userData, setUserData] = useState(initialUserData); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    
    if (!jwtToken) {
        setIsLoading(false);
        setError("Not logged in. Cannot fetch user data. Redirecting to login...");
        
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
            } else {
                console.error("Failed to fetch latest activity. Status:", response.status);
            }
        } catch (err) {
            console.error("Error fetching latest activity:", err);
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
          throw new Error('Session expired or invalid. Please log in again.');
        }

        const userDetails = await response.json();
        
        setUserData(prevData => ({
            ...prevData,
            userLogin: userDetails.userLogin,
            progress: 70, 
            currentCourse: "Python for Beginners",
            currentLesson: "Lesson 5: Loops and Iteration",
            courses: [
              { id: 1, title: "Python for Beginners", progress: 70, color: "blue", lessons: 20, hours: 15, status: 'In Progress' },
              { id: 2, title: "Modern JavaScript", progress: 45, color: "yellow", lessons: 30, hours: 25, status: 'In Progress' },
              { id: 4, title: "Introduction to HTML & CSS", progress: 100, color: "green", lessons: 10, hours: 5, status: 'Completed' },
            ],
            streak: 15,
            xp: 1250,
            badges: 3
        }));

        await fetchLatestActivity();
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        
        if (err.message.includes('Session expired')) {
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

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
  };

  const renderPage = () => {
    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Loading user dashboard...</div>;
    if (error) return <div className="text-center py-10 text-xl font-medium text-red-600">Error: {error}</div>;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent userData={userData} handleNavigation={handleNavigation} />;
      case 'courses':
        return <CoursesPage courses={userData.courses} />; 
      default:
        return <DashboardContent userData={userData} handleNavigation={handleNavigation} />;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hidden spans for Tailwind JIT compilation to ensure colors are included */}
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


      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation('dashboard')}>
            <Zap className="text-indigo-600 w-7 h-7" />
            <span className="text-xl font-extrabold text-gray-900">
              CodeQuest
            </span>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navLinks.map(link => (
              <a 
                key={link.id}
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation(link.id); }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out 
                  ${currentPage === link.id
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-inner' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
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
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <User className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20">
                <a href="#profile" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>
                <a href="#settings" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>
                <a 
                  href="#logout" 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    window.location.replace('/');
                  }}
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
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}