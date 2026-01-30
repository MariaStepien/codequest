import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, X, CheckCircle, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';

export default function EditCoursePage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    totalLessons: 0,
    estimatedHours: 0,
    isPublished: false,
    trophyImgSource: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const jwtToken = localStorage.getItem('token');
  const userLogin = userData?.userLogin || "Admin";

  const API_BASE_URL = '/api/courses';
  const IMAGE_BASE_URL = '/api/uploads';

  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    if (!jwtToken || localStorage.getItem('role') !== 'ADMIN') {
      showToast("Autoryzacja nieudana.", true);
      setTimeout(() => window.location.replace('/'), 1500);
      return;
    }

    const fetchCourseData = async () => {
      try {
        const userResponse = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (!userResponse.ok) throw new Error('Błąd użytkownika.');
        setUserData(await userResponse.json());
        
        const courseResponse = await fetch(`${API_BASE_URL}/${id}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (!courseResponse.ok) throw new Error('Błąd ładowania kursu.');

        const courseData = await courseResponse.json();
        setFormData({
            title: courseData.title || '',
            totalLessons: courseData.totalLessons || 0,
            estimatedHours: courseData.estimatedHours || 0,
            isPublished: courseData.isPublished || false,
            trophyImgSource: courseData.trophyImgSource || ''
        });

      } catch (err) {
        showToast(err.message, true)
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id, jwtToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
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
    setError(null);
    setSuccessMessage('');
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/edit-course`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Nie udało się zaktualizować danych kursu.');

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/${id}/upload-trophy`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${jwtToken}` },
          body: fileData,
        });

        if (uploadResponse.ok) {
          const updatedCourse = await uploadResponse.json();
          setFormData(prev => ({ ...prev, trophyImgSource: updatedCourse.trophyImgSource }));
          setSelectedFile(null);
          setPreviewUrl(null);
        } else {
          throw new Error('Dane zaktualizowane, ale błąd przesyłania zdjęcia.');
        }
      }

      setSuccessMessage('Kurs został pomyślnie zaktualizowany!');
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);

    } catch (err) {
      showToast(err.message, true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Ładowanie...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toast 
        show={toast.show} 
        message={toast.message} 
        isError={toast.isError} 
      />
      <AdminSidebar userLogin={userLogin} currentPage="admin-courses" />
      <main className="md:ml-64"> 
        <div className="max-w-4xl mx-auto py-12 px-4">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
            <Edit className="w-8 h-8 mr-2 text-indigo-600" />
            Edytuj kurs (ID: {id})
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl space-y-6">
            {successMessage && (
              <div className="p-4 text-green-800 rounded-lg bg-green-100 ring-1 ring-green-300 flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" /> {successMessage}
              </div>
            )}
            {error && (
              <div className="p-4 text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300 flex items-center">
                <X className="w-5 h-5 mr-3" /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Tytuł kursu</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Liczba lekcji</label>
                    <input type="number" name="totalLessons" required min="1" value={formData.totalLessons} onChange={handleChange} className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Godziny</label>
                    <input type="number" name="estimatedHours" required min="0" step="0.1" value={formData.estimatedHours} onChange={handleChange} className="text-black mt-1 block w-full rounded-lg border-gray-300 shadow-sm" />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ikona trofeum</label>
              <div className="flex justify-center items-center space-x-6">
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} className="h-24 w-24 object-contain rounded-lg border" alt="Preview" />
                  ) : formData.trophyImgSource ? (
                    <img src={`${IMAGE_BASE_URL}/${formData.trophyImgSource}`} className="h-24 w-24 object-contain rounded-lg border" alt="Current Trophy" />
                  ) : (
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <span>Zmień zdjęcie</span>
                  <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            
            <div className="flex items-center pt-4">
                <input id="isPublished" name="isPublished" type="checkbox" checked={formData.isPublished} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="isPublished" className="ml-3 block text-base font-medium text-gray-700">Opublikowany</label>
            </div>

            <button type="submit" disabled={isSaving} className={`w-full py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white transition ${isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany w kursie'}
            </button>
            <button type="button" onClick={() => navigate('/admin/courses')} className="w-full text-center mt-4 text-sm font-medium text-gray-500 hover:text-indigo-600">Anuluj i wróć</button>
          </form>
        </div>
      </main>
    </div>
  );
}