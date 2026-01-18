import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, X, Loader2, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const CourseProgressTable = ({ usersProgress }) => {
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Użytkownik
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ukończone Lekcje
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status Kursu
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {usersProgress.map((user) => (
            <tr key={user.userId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {user.userLogin}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.completedLessons} / {user.totalLessons}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                {user.isCourseCompleted ? (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" /> Ukończono
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Loader2 className="w-4 h-4 mr-1" /> W trakcie
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function CourseUsersListPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [usersProgress, setUsersProgress] = useState([]);
  const [courseTitle, setCourseTitle] = useState('Ładowanie...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null); 

  const jwtToken = localStorage.getItem('token');
  const userLogin = userData?.userLogin || "Admin";

  useEffect(() => {
    if (!jwtToken || localStorage.getItem('role') !== 'ADMIN') {
      setError("Autoryzacja nieudana. Przenoszę do strony logowania...");
      setTimeout(() => window.location.replace('/'), 1500);
      return;
    }

    const fetchCourseData = async () => {
      try {
        const userResponse = await fetch('http://localhost:8080/api/user/me', {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (!userResponse.ok) throw new Error('Nie udało się pobrać danych użytkownika.');
        setUserData(await userResponse.json());

        const courseResponse = await fetch(`http://localhost:8080/api/courses/${courseId}`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (!courseResponse.ok) throw new Error('Nie udało się pobrać danych kursu.');
        const courseData = await courseResponse.json();
        setCourseTitle(courseData.title);

        const progressResponse = await fetch(`http://localhost:8080/api/progress/list-users/${courseId}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        if (!progressResponse.ok) {
            throw new Error('Nie udało się pobrać listy postępów użytkowników.');
        }

        const progressData = await progressResponse.json();
        setUsersProgress(progressData);
        
      } catch (err) {
        console.error("Błąd pobierania danych kursu/postępów:", err);
        setError(err.message || "Wystąpił nieznany błąd podczas ładowania danych.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, jwtToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-indigo-600 flex items-center">
            <Loader2 className="w-6 h-6 mr-2 animate-spin"/> Ładowanie postępów...
        </div>
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
            
            <button
                onClick={() => navigate('/admin/courses')}
                className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium">
                <ArrowLeft className="w-5 h-5 mr-1" /> Wróć do listy kursów
            </button>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
                <Users className="w-9 h-9 mr-3 text-indigo-600" />
                {courseTitle}
            </h1>
            
            <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-500 overflow-hidden p-6">
                {error && (
                    <div className="flex items-center p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300" role="alert">
                        <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                        <div>{error}</div>
                    </div>
                )}
                
                {usersProgress.length === 0 ? (
                    <p className="text-gray-500 py-4">
                        Brak użytkowników, którzy rozpoczęli ten kurs.
                    </p>
                ) : (
                    <CourseProgressTable usersProgress={usersProgress} />
                )}
            </div>
        </div>
      </main>
    </div>
  );
}