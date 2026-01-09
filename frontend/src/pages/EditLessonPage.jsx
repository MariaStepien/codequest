import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Save, X, CheckCircle, Loader2, Edit, ImageIcon } from 'lucide-react';
import TaskEditor from '../components/TaskEditor';

export default function EditLessonPage() { 
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [lessonData, setLessonData] = useState({
        courseId: '',
        title: '',
        orderIndex: '',
    });
    const [tasks, setTasks] = useState([]);
    const [courses, setCourses] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [enemies, setEnemies] = useState([]);
    const [hasEnemy, setHasEnemy] = useState(false);
    const [selectedEnemyId, setSelectedEnemyId] = useState('');

    const [bgFile, setBgFile] = useState(null);
    const [currentBgImage, setCurrentBgImage] = useState('');
    const [bgPreviewUrl, setBgPreviewUrl] = useState(null);

    
    const currentPage = 'edit-lesson';
    const jwtToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    useEffect(() => {
        if (!jwtToken || storedRole !== 'ADMIN') {
            setError("Brak uprawnień. Przenoszenie do strony logowania...");
            setIsDataLoading(false);
            setTimeout(() => navigate('/'), 2000);
            return;
        }

        const fetchData = async () => {
            setError(null);
            setIsDataLoading(true);
            setHasEnemy(hasEnemy);
            setSelectedEnemyId(selectedEnemyId || '');

            try {
                const lessonResponse = await fetch(`/api/lessons/${lessonId}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                
                if (lessonResponse.ok) {
                    const lesson = await lessonResponse.json();
                    
                    setLessonData({
                        courseId: lesson.courseId,
                        title: lesson.title,
                        orderIndex: lesson.orderIndex,
                    });

                    if (lesson.tasks && Array.isArray(lesson.tasks)) {
                        setTasks(lesson.tasks);
                    } else {
                        setTasks([]);
                    }

                    setCurrentBgImage(lesson.backgroundImage);
                    setHasEnemy(lesson.hasEnemy);
                    setSelectedEnemyId(lesson.enemyId ? String(lesson.enemyId) : '');
                    
                } else {
                    setError(`Nie udało się pobrać szczegółów lekcji o ID: ${lessonId}.`);
                    setIsDataLoading(false);
                    return;
                }
            } catch (err) {
                console.error("Błąd podczas ładowania lekcji:", err);
                setError('Wystąpił błąd sieci podczas ładowania danych lekcji.');
            }

            try {
                const [pubResponse, unpubResponse] = await Promise.all([
                    fetch('/api/courses/published', { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
                    fetch('/api/courses/unpublished', { headers: { 'Authorization': `Bearer ${jwtToken}` } })
                ]);
    
                if (pubResponse.ok && unpubResponse.ok) {
                    const publishedCourses = await pubResponse.json();
                    const unpublishedCourses = await unpubResponse.json();
                    setCourses([...publishedCourses, ...unpublishedCourses]);
                }
            } catch (err) {
                console.error("Błąd podczas ładowania listy kursów:", err);
            }

            fetch('http://localhost:8080/api/enemies', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            })
            .then(res => res.json())
            .then(data => setEnemies(data))
            .catch(err => console.error(err));

            setIsDataLoading(false);
        };

        fetchData();
    }, [lessonId, jwtToken, storedRole, navigate]);


    const handleLessonDataChange = (e) => {
        const { name, value } = e.target;
        setLessonData(prev => ({
            ...prev,
            [name]: name === 'orderIndex' || name === 'courseId' ? Number(value) : value,
        }));
        setSuccessMessage('');
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (tasks.length === 0) {
            setError("Lekcja musi zawierać co najmniej jedno zadanie.");
            return;
        }

        const finalData = {
            ...lessonData,
            tasksJson: JSON.stringify({ tasks }),
            hasEnemy: hasEnemy,
            enemyId: hasEnemy ? selectedEnemyId : null
        };

        const formData = new FormData();
        formData.append('lesson', new Blob([JSON.stringify(finalData)], { type: 'application/json' }));
        if (bgFile) formData.append('file', bgFile);

        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${jwtToken}`
                },
                body:formData,
            });

            if (response.ok) {
                const updatedLesson = await response.json();
                setCurrentBgImage(updatedLesson.backgroundImage);
                setSuccessMessage(`Lekcja "${updatedLesson.title}" została pomyślnie zaktualizowana.`);
            } else if (response.status === 404) {
                setError("Błąd: Nie znaleziono lekcji o podanym ID.");
            } else if (response.status === 400) {
                setError("Błąd walidacji danych: Sprawdź poprawność pól i struktury zadań.");
            } else {
                setError(`Wystąpił błąd podczas aktualizacji lekcji. Status: ${response.status}`);
            }
        } catch (err) {
            console.error("Błąd podczas aktualizacji lekcji:", err);
            setError('Wystąpił nieoczekiwany błąd sieci.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const selectedCourseTitle = courses.find(c => c.id === lessonData.courseId)?.title || 'Wybierz kurs';

    if (isDataLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar currentPage={currentPage} />
                <div className="flex-1 flex flex-col p-8 ml-64 items-center justify-center">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="mt-4 text-gray-700">Ładowanie danych lekcji...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <AdminSidebar currentPage={currentPage} />
            <div className="flex-1 flex flex-col p-8 ml-64">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                        <Edit className="w-8 h-8 text-indigo-600" />
                        <span>Edycja Lekcji: {lessonData.title}</span>
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Zaktualizuj tytuł, kolejność i zawartość lekcji. ID lekcji: {lessonId}
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="flex-1 space-y-8">
                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">Podstawowe Informacje</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tytuł Lekcji</label>
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    value={lessonData.title}
                                    onChange={handleLessonDataChange}
                                    required
                                    className="text-black mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    placeholder="Wprowadzenie do Javy"
                                />
                            </div>

                            <div>
                                <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700">Indeks Kolejności</label>
                                <input
                                    type="number"
                                    name="orderIndex"
                                    id="orderIndex"
                                    value={lessonData.orderIndex}
                                    onChange={handleLessonDataChange}
                                    required
                                    min="1"
                                    className="text-black mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    placeholder="1"
                                />
                            </div>

                            <div>
                                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Przypisany Kurs</label>
                                <select
                                    name="courseId"
                                    id="courseId"
                                    value={lessonData.courseId}
                                    onChange={handleLessonDataChange}
                                    required
                                    className="text-black mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                                >
                                    <option value="" disabled>Wybierz kurs...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title} (ID: {course.id})
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">Aktualnie: {selectedCourseTitle}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
                        <label className="text-lg font-bold text-gray-700 block mb-4">Tło lekcji</label>
                        {(bgPreviewUrl || currentBgImage) && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">
                                    {bgPreviewUrl ? "Podgląd nowego zdjęcia:" : "Aktualne tło:"}
                                </p>
                                <div className="flex justify-center">
                                    <img
                                        src={bgPreviewUrl || `http://localhost:8080/api/${currentBgImage}`}
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
                                            "Kliknij, aby zmienić zdjęcie tła"
                                        )}
                                    </p>
                                </div>
                                <input 
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setBgFile(file);
                                            setBgPreviewUrl(URL.createObjectURL(file));
                                        }
                                    }}
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
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="enemySelect" className="block text-sm font-medium text-gray-700 mb-1">Wybierz przeciwnika</label>
                                    <select
                                        id="enemySelect"
                                        value={selectedEnemyId}
                                        onChange={(e) => setSelectedEnemyId(e.target.value)}
                                        className="text-black block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    >
                                        <option value="">-- Wybierz z listy --</option>
                                        {enemies.map(enemy => (
                                            <option key={enemy.id} value={enemy.id}>
                                                {enemy.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedEnemyId && (
                                    (() => {
                                        const enemy = enemies.find(e => e.id == selectedEnemyId);
                                        if (!enemy) return null;
                                        return (
                                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                                <img
                                                    src={`http://localhost:8080/api/${enemy.imgSource}`}
                                                    className="w-12 h-12 object-contain"
                                                    alt={enemy.name}
                                                />
                                                <span className="text-sm font-medium text-indigo-700">
                                                    Wybrano: {enemy.name}
                                                </span>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
                       <h2 className="text-xl font-semibold border-b pb-2 text-gray-800">Zawartość Lekcji (Zadania)</h2>
            
                        <TaskEditor 
                            tasks={tasks}
                            onTasksChange={setTasks}
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center p-4 text-sm font-medium text-red-800 rounded-lg bg-red-100 ring-1 ring-red-300" role="alert">
                            <X className="flex-shrink-0 inline w-5 h-5 mr-3" />
                            <div>{error}</div>
                        </div>
                    )}
                    
                    {successMessage && (
                        <div className="flex items-center p-4 text-sm font-medium text-green-800 rounded-lg bg-green-100 ring-1 ring-green-300" role="alert">
                            <CheckCircle className="flex-shrink-0 inline w-5 h-5 mr-3" />
                            <div>{successMessage}</div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || tasks.length === 0}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md font-bold text-white transition duration-200 ease-in-out transform hover:scale-[1.01] ${
                                isLoading || tasks.length === 0
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                  Zapisywanie zmian...
                                </>
                            ) : (
                                <>
                                    <Save className="-ml-1 mr-2 h-5 w-5" />
                                    <span>Zapisz Zmiany</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}