import { useState, useEffect } from 'react';
import { BookOpenText, Eye, EyeOff, CheckCircle, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const CourseListItem = ({ course, navigate }) => {
  const isPublished = course.isPublished;
  const statusColor = isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const statusIcon = isPublished ? <CheckCircle className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;
  const statusText = isPublished ? 'Opublikowany' : 'Nieopublikowany';

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg mb-3 hover:shadow-lg transition duration-150">
      <div className="flex flex-col">
        <span className="text-lg text-left font-semibold text-gray-800">{course.title}</span>
        <span className="text-sm  text-left text-gray-500">ID: {course.id} | Lekcji: {course.totalLessons} | Czas: {course.estimatedHours}h</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}>
          {statusIcon}
          <span>{statusText}</span>
        </span>
        <button 
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            onClick={() => navigate(`/admin/edit-course/${course.id}`)}
        >
            Edytuj
        </button>
      </div>
    </div>
  );
};

export default function AdminCoursesPage() {
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [unpublishedCourses, setUnpublishedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('published');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null); 
  
  const jwtToken = localStorage.getItem('token');
  const userLogin = userData?.userLogin || "Admin";
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwtToken || localStorage.getItem('role') !== 'ADMIN') {
      setError("Autoryzacja nieudana. Przenoszę do strony logowania...");
      setTimeout(() => window.location.replace('/'), 1500);
      return;
    }

    const tabClass = (tabId) => {
        return `
        px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
        ${activeTab === tabId 
            ? 'text-indigo-700 bg-white border-b-2 border-indigo-600' 
            : 'text-gray-500 hover:text-indigo-700 hover:bg-gray-50'
        }
        `;
    };

    const fetchAdminDataAndCourses = async () => {
      try {
        const userResponse = await fetch('http://localhost:8080/api/user/me', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!userResponse.ok) throw new Error('Nie udało się pobrać danych użytkownika.');
        
        const userData = await userResponse.json();
        setUserData(userData);

        const publishedResponse = await fetch('http://localhost:8080/api/courses/published', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        const unpublishedResponse = await fetch('http://localhost:8080/api/courses/unpublished', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        if (!publishedResponse.ok || !unpublishedResponse.ok) {
            throw new Error('Nie udało się pobrać wszystkich list kursów.');
        }

        setPublishedCourses(await publishedResponse.json());
        setUnpublishedCourses(await unpublishedResponse.json());
        
      } catch (err) {
        console.error("Błąd pobierania kursów:", err);
        setError(err.message || "Wystąpił nieznany błąd podczas ładowania kursów.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDataAndCourses();
  }, []);

  const coursesToDisplay = activeTab === 'published' ? publishedCourses : unpublishedCourses;
  const tabClass = (tabName) => 
    `py-2 px-4 text-sm font-medium border-b-2 transition duration-150 ${
      activeTab === tabName 
        ? 'border-indigo-600 text-indigo-600 font-semibold' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`;


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-indigo-600">Ładowanie list kursów...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AdminSidebar
        userLogin={userLogin} 
        currentPage="admin-courses" 
      />
      
      <main className="md:ml-64"> 
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
                <BookOpenText className="w-9 h-9 mr-3 text-indigo-600" />
                Zarządzanie Kursami
            </h1>
            
            <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-500 overflow-hidden">
            
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 px-6 pt-2">
                <button onClick={() => setActiveTab('published')} className={tabClass('published')}>
                  Opublikowane ({publishedCourses.length})
                </button>
                <button onClick={() => setActiveTab('unpublished')} className={tabClass('unpublished')}>
                  Nieopublikowane ({unpublishedCourses.length})
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="flex items-center p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300" role="alert">
                  <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                  <div>{error}</div>
                </div>
              )}
              
              {coursesToDisplay.length === 0 ? (
                <p className="text-gray-500 py-4">
                  Brak kursów w tej kategorii.
                </p>
              ) : (
                <div className="space-y-4">
                  {coursesToDisplay.map(course => (
                    <CourseListItem key={course.id} course={course} navigate={navigate} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}