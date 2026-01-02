import { useState, useEffect } from 'react';
import { BookOpenText, EyeOff, CheckCircle, X, List, Trash2, Loader2, Users, Edit } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const CourseListItem = ({ course, navigate, onDelete }) => {
  const isPublished = course.isPublished;
  const statusColor = isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  const statusIcon = isPublished ? <CheckCircle className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;
  const statusText = isPublished ? 'Opublikowany' : 'Nieopublikowany';

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg mb-3 hover:shadow-lg transition duration-150 border-l-4 border-indigo-500">
      <div className="flex flex-col">
        <span className="text-lg text-left font-semibold text-gray-800">{course.title}</span>
        <span className="text-sm text-left text-gray-500">ID: {course.id} | Lekcji: {course.totalLessons}</span>
        <div className={`flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-bold w-fit ${statusColor}`}>
          {statusIcon}
          <span>{statusText}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate(`/admin/edit-course/${course.id}`)}
          className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition"
          title="Edytuj kurs"
        >
          <Edit className="w-5 h-5" />
        </button>

        <button 
          onClick={() => navigate(`/admin/course-lessons/${course.id}`)}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition"
          title="Lista lekcji"
        >
          <List className="w-5 h-5" />
        </button>

        <button 
          onClick={() => navigate(`/admin/course-users-progress/${course.id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
          title="Postępy użytkowników"
        >
          <Users className="w-5 h-5" />
        </button>
        
        {!isPublished && (
          <button 
            onClick={() => onDelete(course.id, course.title)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
            title="Usuń kurs"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default function AdminCoursesPage() {
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [unpublishedCourses, setUnpublishedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('published');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const jwtToken = localStorage.getItem('token');

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pubRes, unpubRes] = await Promise.all([
        fetch('/api/courses/published', { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
        fetch('/api/courses/unpublished', { headers: { 'Authorization': `Bearer ${jwtToken}` } })
      ]);

      if (pubRes.ok && unpubRes.ok) {
        setPublishedCourses(await pubRes.json());
        setUnpublishedCourses(await unpubRes.json());
      } else {
        setError("Błąd podczas pobierania kursów.");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId, title) => {
    const confirmationMsg = `Czy na pewno chcesz usunąć kurs "${title}"?\n\n` +
                          `UWAGA: Ta operacja jest nieodwracalna. Zostaną usunięte:\n` +
                          `- Wszystkie lekcje przypisane do kursu\n` +
                          `- Wszystkie postępy i wyniki użytkowników\n` +
                          `- Grafika trofeum z serwera`;

    if (!window.confirm(confirmationMsg)) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });

      if (response.ok) {
        setUnpublishedCourses(prev => prev.filter(c => c.id !== courseId));
      } else {
        const msg = await response.text();
        alert(msg || "Nie udało się usunąć kursu.");
      }
    } catch (err) {
      alert("Wystąpił błąd podczas usuwania.");
    }
  };

  const coursesToDisplay = activeTab === 'published' ? publishedCourses : unpublishedCourses;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="admin-courses" />
      <div className="flex-1 flex flex-col p-8 ml-64">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <BookOpenText className="w-8 h-8 text-indigo-600" />
              <span>Zarządzanie Kursami</span>
            </h1>
          </div>
          <button 
            onClick={() => navigate('/admin/create-course')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
          >
            + Nowy Kurs
          </button>
        </header>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="border-b border-gray-200 bg-gray-50/50">
            <nav className="flex space-x-4 px-6 pt-2">
              <button 
                onClick={() => setActiveTab('published')} 
                className={`pb-4 px-2 text-sm font-semibold transition-colors duration-200 ${activeTab === 'published' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Opublikowane ({publishedCourses.length})
              </button>
              <button 
                onClick={() => setActiveTab('unpublished')} 
                className={`pb-4 px-2 text-sm font-semibold transition-colors duration-200 ${activeTab === 'unpublished' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Nieopublikowane ({unpublishedCourses.length})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-gray-500 animate-pulse">Pobieranie danych...</p>
              </div>
            ) : error ? (
              <div className="flex items-center p-4 text-red-800 rounded-lg bg-red-50 border border-red-100">
                <X className="w-5 h-5 mr-3" />
                <span className="font-medium">{error}</span>
              </div>
            ) : coursesToDisplay.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Brak kursów w tej kategorii.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {coursesToDisplay.map(course => (
                  <CourseListItem 
                    key={course.id} 
                    course={course} 
                    navigate={navigate} 
                    onDelete={handleDeleteCourse}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}