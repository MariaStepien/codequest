import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, X, CheckCircle } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function EditCoursePage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    totalLessons: 0,
    estimatedHours: 0,
    isPublished: false,
  });
  const [userData, setUserData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const jwtToken = localStorage.getItem('token');
  const userLogin = userData?.userLogin || "Admin";

  const API_BASE_URL = 'http://localhost:8080/api/courses';

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
        
        const courseResponse = await fetch(`${API_BASE_URL}/${id}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (courseResponse.status === 404) {
             throw new Error(`Kurs o ID ${id} nie został znaleziony.`);
        }
        if (!courseResponse.ok) {
            throw new Error('Wystąpił błąd podczas ładowania danych kursu.');
        }

        const courseData = await courseResponse.json();
        setFormData({
            title: courseData.title || '',
            totalLessons: courseData.totalLessons || 0,
            estimatedHours: courseData.estimatedHours || 0,
            isPublished: courseData.isPublished || false,
        });

      } catch (err) {
        console.error("Błąd ładowania danych:", err);
        setError(err.message || "Wystąpił nieznany błąd podczas ładowania kursu.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
        fetchCourseData();
    } else {
        navigate('/admin/courses');
    }
    
  }, [id, jwtToken, navigate]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsSaving(true);
    
    const dataToSend = {
        title: formData.title,
        totalLessons: formData.totalLessons,
        estimatedHours: formData.estimatedHours,
        isPublished: formData.isPublished,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.status === 404) {
        throw new Error(`Błąd zapisu: Kurs o ID ${id} nie istnieje.`);
      }
      
      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować kursu. Sprawdź poprawność danych.');
      }

      setSuccessMessage('Kurs został pomyślnie zaktualizowany!');

    } catch (err) {
      console.error("Błąd podczas zapisywania kursu:", err);
      setError(err.message || "Wystąpił nieznany błąd podczas edycji kursu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-indigo-600">Ładowanie danych kursu...</div>
      </div>
    );
  }
  
  if (error && !successMessage) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <AdminSidebar userLogin={userLogin} currentPage="admin-courses" />
        <main className="md:ml-64 p-8">
            <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
                <p className="text-red-700 font-medium">{error}</p>
                <button onClick={() => navigate('/admin/courses')} className="mt-4 text-indigo-600 hover:text-indigo-800">
                    Wróć do listy kursów
                </button>
            </div>
        </main>
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
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
            <Edit className="w-8 h-8 mr-2 text-indigo-600" />
            Edytuj kurs (ID: {id})
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl space-y-6">
            
            {successMessage && (
              <div className="flex items-center p-4 text-sm font-medium text-green-800 rounded-lg bg-green-100 ring-1 ring-green-300">
                <CheckCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <div>{successMessage}</div>
              </div>
            )}
            
            {error && (
              <div className="flex items-center p-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300">
                <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <div>{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tytuł kursu</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="totalLessons" className="block text-sm font-medium text-gray-700">Całkowita liczba lekcji</label>
              <input
                type="number"
                name="totalLessons"
                id="totalLessons"
                required
                min="1"
                value={formData.totalLessons}
                onChange={handleChange}
                className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">Szacowany czas (w godzinach)</label>
              <input
                type="number"
                name="estimatedHours"
                id="estimatedHours"
                required
                min="0"
                step="0.1"
                value={formData.estimatedHours}
                onChange={handleChange}
                className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-center pt-4">
                <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPublished" className="ml-3 block text-base font-medium text-gray-700">
                    Opublikowany (widoczny dla użytkowników)
                </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition duration-200 ease-in-out transform hover:scale-[1.01] ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.965l3-2.674z"></path>
                  </svg>
                  Zapisywanie...
                </>
              ) : 'Zapisz zmiany w kursie'}
            </button>
            
            <button 
                type="button" 
                onClick={() => navigate('/admin/courses')} 
                className="w-full text-center mt-4 text-sm font-medium text-gray-500 hover:text-indigo-600 transition duration-150"
            >
                Anuluj i wróć
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}