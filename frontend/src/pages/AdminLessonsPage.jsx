import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { BookOpenText, ListOrdered, X, Edit, Loader2, Trash2, Eye } from 'lucide-react';

const LessonListItem = ({ lesson, navigate, onDelete, isPublished, courseId }) => {
  const handleEditLesson = () => {
    navigate(`/admin/edit-lesson/${lesson.id}`);
  };

  const handlePreviewLesson = () => {
    navigate(`/admin/preview-lesson/${courseId}/level/${lesson.orderIndex}`);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition duration-150 border-l-4 border-indigo-400">
      <div className="flex flex-col text-left">
        <span className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <span className="text-indigo-600 w-6 text-center">{lesson.orderIndex}.</span>
          <span>{lesson.title}</span>
        </span>
        <span className="text-sm text-gray-500 ml-8">
          ID: {lesson.id}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <button 
          onClick={handlePreviewLesson}
          className="flex items-center space-x-1 px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition"
        >
          <Eye className="w-4 h-4" />
          <span>Podgląd</span>
        </button>
        <button 
          onClick={handleEditLesson}
          className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition duration-150"
          title="Edytuj lekcję"
        >
          <Edit className="w-4 h-4" />
          <span>Edytuj</span>
        </button>

        {!isPublished && (
          <button 
            onClick={() => onDelete(lesson.id, lesson.title)}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition duration-150"
            title="Usuń lekcję"
          >
            <Trash2 className="w-4 h-4" />
            <span>Usuń</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default function AdminLessonsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [courseTitle, setCourseTitle] = useState('...'); 
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentPage = 'admin-courses';
  const jwtToken = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role');

  const fetchLessonsAndCourseData = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const courseResponse = await fetch(`/api/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        setCourseTitle(courseData.title);
        setIsPublished(courseData.isPublished || false);
      } else {
        setCourseTitle('Nieznany Kurs');
      }

      const lessonsResponse = await fetch(`/api/lessons/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
      } else {
        setError(`Nie udało się pobrać listy lekcji dla kursu ID ${courseId}.`);
      }

    } catch (err) {
      console.error("Błąd podczas ładowania danych:", err);
      setError('Wystąpił nieoczekiwany błąd podczas komunikacji z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!jwtToken || storedRole !== 'ADMIN') {
        setError("Brak uprawnień. Przenoszenie do strony logowania...");
        setTimeout(() => navigate('/'), 2000);
        return;
    }

    fetchLessonsAndCourseData();
  }, [courseId, jwtToken, storedRole, navigate]);

  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    const confirmed = window.confirm(
      `Czy na pewno chcesz usunąć lekcję "${lessonTitle}"? Spowoduje to również trwałe usunięcie wszystkich rekordów postępów użytkowników powiązanych z tą lekcją.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${jwtToken}` 
        }
      });

      if (response.ok) {
        setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Wystąpił błąd podczas usuwania lekcji.");
      }
    } catch (err) {
      alert("Wystąpił nieoczekiwany błąd podczas próby usunięcia lekcji.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage={currentPage} />
      <div className="flex-1 flex flex-col p-8 ml-64">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BookOpenText className="w-8 h-8 text-indigo-600" />
            <span>Lista Lekcji dla Kursu: {courseTitle}</span>
          </h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-gray-500">
              Zarządzanie lekcjami w kursie. ID kursu: {courseId}
            </p>
          </div>
        </header>

        <div className="flex-1 bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center space-x-2 text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p>Ładowanie lekcji...</p>
              </div>
            )}

            {error && (
              <div className="flex items-center p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300" role="alert">
                <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <div>{error}</div>
              </div>
            )}
            
            {!isLoading && lessons.length === 0 && !error && (
              <p className="text-gray-500 py-4">
                Ten kurs nie ma jeszcze żadnych lekcji.
              </p>
            )}

            <div className="space-y-4">
              {lessons.map(lesson => (
                <LessonListItem 
                    key={lesson.id} 
                    lesson={lesson} 
                    navigate={navigate} 
                    onDelete={handleDeleteLesson}
                    isPublished={isPublished}
                    courseId = {courseId}
                />
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4">
                <button
                    onClick={() => navigate('/admin/create-lesson')}
                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150"
                >
                    <ListOrdered className="w-5 h-5" />
                    <span>Dodaj Nową Lekcję</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}