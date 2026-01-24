import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar'; 
import { Upload, X, CheckCircle, ImageIcon } from 'lucide-react';
import TaskEditor from '../components/TaskEditor';
import Toast from '../components/Toast';

const initialLessonData = {
    courseId: '',
    title: '',
    orderIndex: '',
};

export default function LessonCreationPage() { 
    const [lessonData, setLessonData] = useState(initialLessonData);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [tasks, setTasks] = useState([]);
    
    const [userData, setUserData] = useState(null); 
    const [isDataLoading, setIsDataLoading] = useState(true);
    const currentPage = 'add-lesson';

    const [enemies, setEnemies] = useState([]);
    const [hasEnemy, setHasEnemy] = useState(false);
    const [selectedEnemyId, setSelectedEnemyId] = useState('');

    const [bgFile, setBgFile] = useState(null);
    const [maxAllowedIndex, setMaxAllowedIndex] = useState(null);

    const jwtToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const fetchNextOrderIndex = async (courseId) => {
        if (!courseId) return;
        try {
            const response = await fetch(`/api/lessons/course/${courseId}/next-order`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const nextIndex = await response.json();
                setLessonData(prev => ({ ...prev, orderIndex: nextIndex }));
                setMaxAllowedIndex(nextIndex);
            }
        } catch (err) {
            console.error("Błąd pobierania indeksu:", err);
        }
    };

    const showToast = (message, isError = false) => {
        setToast({ show: true, message, isError });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    useEffect(() => {
        
        if (!jwtToken || storedRole !== 'ADMIN') {
            setError("Brak uprawnień lub użytkownik nie zalogowany. Przenoszę do strony logowania...");
            setIsDataLoading(false);
            setTimeout(() => {
                window.location.replace('/'); 
            }, 1500); 
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user/me', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${jwtToken}` },
                });
                
                if (response.ok) {
                    const userDetails = await response.json();
                    setUserData(userDetails);
                } else {
                    throw new Error("Nie udało się pobrać danych użytkownika.");
                }
            } catch (err) {
                console.error("Błąd podczas pobierania danych użytkownika:", err);
                setError("Błąd uwierzytelnienia. Spróbuj zalogować się ponownie.");
                localStorage.clear();
                setTimeout(() => window.location.replace('/'), 2000);
            } finally {
                setIsDataLoading(false);
            }
        };

        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses', { 
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                
                if (!response.ok) {
                    throw new Error(`Błąd pobierania kursów: ${response.statusText}`);
                }
                const data = await response.json();
                
                if (data.length > 0) {
                    setCourses(data);
                    const firstCourseId = data[0].id;
                    setLessonData(prev => ({ ...prev, courseId: firstCourseId }));
                    fetchNextOrderIndex(firstCourseId);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchEnemyData = async () => {
            fetch('/api/enemies', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            .then(res => res.json())
            .then(data => setEnemies(data))
            .catch(err => console.error(err));
        }

        fetchUserData();
        fetchCourses();
        fetchEnemyData();

    }, [jwtToken, storedRole]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'orderIndex' ? parseInt(value, 10) : value;

        setLessonData({ ...lessonData, [name]: finalValue });

        if (name === 'courseId') {
            fetchNextOrderIndex(value);
        }
    };

    const handleTasksChange = useCallback((newTasks) => {
        setTasks(newTasks);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setIsLoading(true);

        if (tasks.length === 0) {
            showToast("Lekcja musi zawierać co najmniej jedno zadanie.", true);
            setIsLoading(false);
            return;
        }

        const tasksJsonString = JSON.stringify({ tasks: tasks });

        const lessonPayload = {
            ...lessonData,
            tasksJson: tasksJsonString,
            hasEnemy: hasEnemy,
            enemyId: hasEnemy ? selectedEnemyId : null
        };

        const formData = new FormData();
        formData.append('lesson', new Blob([JSON.stringify(lessonPayload)], { type: 'application/json' }));
        if (bgFile) {
            formData.append('file', bgFile);
        }

        try {
            const response = await fetch('/api/lessons/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: formData,
            });

            if (response.status === 403) {
                throw new Error("Brak uprawnień. Tylko administrator może tworzyć lekcje.");
            }
            if (!response.ok) {
                const errorDetail = await response.text();
                throw new Error(`Błąd tworzenia lekcji. Status: ${response.status}. Szczegóły: ${errorDetail.substring(0, 100)}...`);
            }

            const createdLesson = await response.json();
            setSuccessMessage(`Pomyślnie utworzono lekcję: ${createdLesson.title} (ID: ${createdLesson.id}).`);
            
            setLessonData(initialLessonData);
            const defaultCourseId = courses[0]?.id || '';
            setLessonData(prev => ({ ...prev, courseId: defaultCourseId }));
            if (defaultCourseId) fetchNextOrderIndex(defaultCourseId);
            setTasks([]);
            setBgFile(null);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isDataLoading) {
        return <div className="text-center py-10 text-xl font-semibold">Ładowanie danych użytkownika...</div>;
    }
    
    if (storedRole !== 'ADMIN' || !userData) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar 
                userLogin={userData?.userLogin || 'Admin'} 
                currentPage={currentPage}
            />
            
            <main className="flex-1 overflow-y-auto p-8 lg:ml-64">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-gray-900 pb-2">
                        <Upload className="inline-block w-8 h-8 mr-2 text-indigo-600"/> Utwórz Nową Lekcję
                    </h1>
                    
                    {error && (
                        <div className="flex items-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            <X className="w-5 h-5 mr-3"/>
                            <span>{error}</span>
                        </div>
                    )}
                    {successMessage && (
                        <div className="flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                            <CheckCircle className="w-5 h-5 mr-3"/>
                            <span>{successMessage}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 shadow-xl rounded-lg space-y-6">
                        <div>
                            <label htmlFor="courseId" className="block text-sm font-bold text-gray-700 mb-1">
                                Wybierz Kurs
                            </label>
                            <select
                                id="courseId"
                                name="courseId"
                                value={lessonData.courseId}
                                onChange={handleChange}
                                required
                                className="text-black mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                disabled={isLoading || courses.length === 0}
                            >
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} (ID: {course.id})
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>Brak dostępnych kursów</option>
                                )}
                            </select>
                            {courses.length === 0 && <p className="text-red-500 text-xs mt-1">Brak kursów. Dodaj kurs, aby móc dodać lekcję.</p>}
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                                Tytuł Lekcji
                            </label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={lessonData.title}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="text-black mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3 border focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Wprowadź tytuł lekcji"
                            />
                        </div>

                        <div>
                            <label htmlFor="orderIndex" className="block text-sm font-bold text-gray-700 mb-1">
                                Indeks Kolejności (Automatyczny)
                            </label>
                            <input
                                type="number"
                                name="orderIndex"
                                id="orderIndex"
                                value={lessonData.orderIndex}
                                readOnly
                                className="text-gray-500 mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-3 border bg-gray-100 focus:ring-0"
                                placeholder="Pobieranie indeksu..."
                            />
                            <p className="mt-1 text-xs text-indigo-600 font-medium">
                                Indeks jest przypisywany automatycznie, aby zachować ciągłość lekcji.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                            <label className="text-lg font-bold text-gray-700 block mb-4">Tło lekcji (opcjonalnie)</label>
                            
                            {bgFile && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Wybrane zdjęcie:</p>
                                    <div className='flex justify-center'>
                                        <img 
                                            src={URL.createObjectURL(bgFile)} 
                                            alt="Background preview" 
                                            className="h-32 rounded-lg border object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 text-center px-4">
                                            {bgFile ? (
                                                <span className="font-medium text-indigo-600">{bgFile.name}</span>
                                            ) : (
                                                "Kliknij, aby dodać zdjęcie tła"
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setBgFile(e.target.files[0])} 
                                        accept="image/*"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-lg font-bold text-gray-700">Przeciwnik w lekcji</label>
                                <button
                                    type="button"
                                    onClick={() => setHasEnemy(!hasEnemy)}
                                    className={`px-4 py-2 rounded-lg font-bold transition ${hasEnemy ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {hasEnemy ? "Aktywny" : "Brak przeciwnika"}
                                </button>
                            </div>

                            {hasEnemy && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <select
                                        value={selectedEnemyId}
                                        onChange={(e) => setSelectedEnemyId(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Wybierz przeciwnika...</option>
                                        {enemies.map(enemy => (
                                            <option key={enemy.id} value={enemy.id}>{enemy.name}</option>
                                        ))}
                                    </select>
                                    
                                    {selectedEnemyId && enemies.find(e => e.id == selectedEnemyId) && (
                                        <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                            <img 
                                                src={`/api/${enemies.find(e => e.id == selectedEnemyId).imgSource}`} 
                                                className="w-12 h-12 object-contain" 
                                                alt="preview"
                                            />
                                            <span className="text-sm font-medium text-indigo-700">Podgląd wybranego przeciwnika</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Edytor Zadań Lekcji</h2>
                            <TaskEditor 
                                tasks={tasks} 
                                onTasksChange={handleTasksChange} 
                                disabled={isLoading}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Dodaj, edytuj i zmieniaj kolejność zadań. Dane zostaną automatycznie przekształcone na JSON.
                            </p>
                        </div>

                        <div className="pt-5">
                            <button
                                type="submit"
                                disabled={isLoading || courses.length === 0 || tasks.length === 0}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white transition duration-200 ease-in-out transform hover:scale-[1.01] ${
                                    isLoading || courses.length === 0 || tasks.length === 0
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.13..."></path>
                                      </svg>
                                      Tworzenie lekcji...
                                    </>
                                ) : (
                                    'Utwórz Lekcję'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Toast 
                show={toast.show} 
                message={toast.message} 
                isError={toast.isError} 
            />
        </div>
    );
}