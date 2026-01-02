import { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const initialCourseData = {
  title: '',
  totalLessons: 10,
  estimatedHours: 5,
};

export default function CourseCreationPage() { 
  const [formData, setFormData] = useState(initialCourseData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userData, setUserData] = useState(null); 
  const [isDataLoading, setIsDataLoading] = useState(true);

  const jwtToken = localStorage.getItem('token');
  const navigate = useNavigate();

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
  }, [jwtToken]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'number' ? parseInt(value) || 0 : value, 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    
    if (!jwtToken || localStorage.getItem('role') !== 'ADMIN') {
      setError("Autoryzacja nieudana.");
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Błąd serwera.' }));
        throw new Error(errorData.message || 'Nie udało się utworzyć kursu.');
      }

      const createdCourse = await response.json();

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);

        const uploadResponse = await fetch(`http://localhost:8080/api/courses/${createdCourse.id}/upload-trophy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: fileData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Kurs utworzony, ale nie udało się przesłać zdjęcia trofeum.');
        }
      }

      setSuccessMessage(`Kurs "${createdCourse.title}" został utworzony pomyślnie.`);
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);
      
    } catch (err) {
      setError(err.message); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-indigo-600">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AdminSidebar userLogin={userData.userLogin || "Admin"} currentPage="add-course" />
      <main className="md:ml-64"> 
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
            {successMessage && (
              <div className="flex items-center p-4 mb-4 text-sm font-medium text-green-800 rounded-lg bg-green-100 ring-1 ring-green-300">
                <CheckCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <div>{successMessage}</div>
              </div>
            )}
            {error && (
              <div className="flex items-center p-4 mb-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300">
                <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">Tytuł kursu</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="totalLessons" className="block text-sm font-semibold text-gray-700 mb-1">Liczba lekcji</label>
                  <input
                    type="number"
                    name="totalLessons"
                    id="totalLessons"
                    value={formData.totalLessons}
                    onChange={handleChange}
                    required
                    min="1"
                    className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  />
                </div>
                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-semibold text-gray-700 mb-1">Godziny</label>
                  <input
                    type="number"
                    name="estimatedHours"
                    id="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    required
                    min="1"
                    className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ikona trofeum (opcjonalnie)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-32 object-contain mb-2" />
                        <button 
                          type="button" 
                          onClick={() => {setSelectedFile(null); setPreviewUrl(null);}}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="trophy-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Wgraj plik</span>
                        <input id="trophy-upload" name="trophy-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG do 2MB</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition duration-200 ${
                  isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? 'Tworzenie...' : 'Utwórz kurs'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}