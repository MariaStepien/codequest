import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import Header from '../components/Header';

export default function TrophiesPage() {
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const jwtToken = localStorage.getItem('token');
  const IMAGE_BASE_URL = '/api/uploads';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const user = await userRes.json();
        setUserData(user);

        const coursesRes = await fetch('/api/courses/with-progress', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        const allCourses = await coursesRes.json();
        
        const completedCourses = allCourses.filter(
          course => course.completedLevels === course.totalLessons && course.totalLessons > 0
        );
        
        setCourses(completedCourses);
      } catch (error) {
        console.error("Error fetching trophies:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jwtToken]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = courses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userLogin={userData?.userLogin || 'Użytkownik'} currentPage="trofies" />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Twoje Trofea
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Osiągnięcia zdobyte za ukończenie kursów
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200">
            <Trophy className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nie zdobyłeś jeszcze żadnych trofeów. Ukończ kurs, aby go tutaj zobaczyć!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 p-6 flex flex-col items-center"
                >
                  <div className="w-48 h-48 flex items-center justify-center mb-6 bg-indigo-50 rounded-full">
                    {course.trophyImgSource ? (
                      <img 
                        src={`${IMAGE_BASE_URL}/${course.trophyImgSource}`} 
                        alt={course.title} 
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150?text=Trophy';
                        }}
                      />
                    ) : (
                      <Trophy className="w-24 h-24 text-indigo-300" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center uppercase tracking-wide">
                    {course.title}
                  </h3>
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ukończono
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full bg-white shadow border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                
                <span className="text-gray-700 font-medium">
                  Strona {currentPage} z {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full bg-white shadow border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}