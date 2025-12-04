import { useState, useEffect } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const initialCourseData = {
  title: '',
  totalLessons: 10,
  estimatedHours: 5,
};

export default function CourseCreationPage() { 
  const [formData, setFormData] = useState(initialCourseData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userData, setUserData] = useState(null); 
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('edit-course');


  const jwtToken = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role');

  useEffect(() => {
    
    if (!jwtToken) {
        setIsLoading(false);
        setError("Użytkownik nie zalogowany. Przenoszę do strony logowania...");
        
        setTimeout(() => {
            window.location.replace('/'); 
        }, 1500); 
        return;
    }

    const fetchUserData = async () => {
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
        setIsDataLoading(false);

      } catch (error) {
        console.error("Błąd pobrania danych użytkownika:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value) || 0 : value, 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    
    if (!jwtToken || localStorage.getItem('role') !== 'ADMIN') {
      setError("Autoryzacja nieudana. Upewnij się, że jesteś na koncie z uprawnieniami admina.");
      setIsLoading(false);
      return;
    }
    
    if (!formData.title || formData.totalLessons <= 0 || formData.estimatedHours <= 0) {
        setError("Wypełnij poprawnie wszystkie pola (liczba lekcji i godzin musi być większa od 0).");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/courses/create-course', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`, 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 403) {
        throw new Error('Dostęp zabroniony. Tylko użytkownicy z uprawnieniem admina mogą tworzyć kursy.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Nie udało się utworzyć kursu z powodu błędu serwera.' }));
        throw new Error(errorData.message || 'Nie udało się utworzyć kursu.');
      }

      const createdCourse = await response.json();
      setSuccessMessage(`Kurs "${createdCourse.title}" (ID: ${createdCourse.id}) został utworzony.`);
      setFormData(initialCourseData);
      
    } catch (err) {
      console.error("Błąd tworzenia kursu:", err);
      setError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-indigo-600">Ładowanie danych użytkownika i autoryzacji...</div>
      </div>
    );
  }

  const statusMessage = successMessage ? (
    <div className="flex items-center p-4 mb-4 text-sm font-medium text-green-800 rounded-lg bg-green-100 ring-1 ring-green-300" role="alert">
      <CheckCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
      <div>{successMessage}</div>
    </div>
  ) : error ? (
    <div className="flex items-center p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300" role="alert">
      <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
      <div>{error}</div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <div className="hidden">
        <span className="text-red-500 border-red-200 bg-red-50 border-red-300 bg-red-100"></span>
        <span className="text-green-800 bg-green-100 ring-1 ring-green-300"></span>
        <span className="text-red-800 bg-red-100 ring-1 ring-red-300"></span>
        <span className="bg-indigo-100 text-indigo-700 border-indigo-600 hover:text-indigo-700"></span>
        <span className="text-red-600 hover:bg-red-50"></span>
      </div>

      <AdminSidebar
        userLogin={userData.userLogin || "Admin"} 
        currentPage="add-course" 
      />
      
      <main className="md:ml-64"> 
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
              {statusMessage}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                    Tytuł kursu
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="np. Wstęp do baz danych"
                    required
                    className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition duration-150 ease-in-out"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="totalLessons" className="block text-sm font-semibold text-gray-700 mb-1">
                        Liczba lekcji
                      </label>
                      <input
                        type="number"
                        name="totalLessons"
                        id="totalLessons"
                        value={formData.totalLessons}
                        onChange={handleChange}
                        required
                        min="1"
                        className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition duration-150 ease-in-out"
                      />
                  </div>

                  <div>
                      <label htmlFor="estimatedHours" className="block text-sm font-semibold text-gray-700 mb-1">
                        Szacowany czas wykonania
                      </label>
                      <input
                        type="number"
                        name="estimatedHours"
                        id="estimatedHours"
                        value={formData.estimatedHours}
                        onChange={handleChange}
                        required
                        min="1"
                        className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border transition duration-150 ease-in-out"
                      />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition duration-200 ease-in-out transform hover:scale-[1.01] ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Udostępnianie...
                    </>
                  ) : (
                    <>
                      Utwórz kurs
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}