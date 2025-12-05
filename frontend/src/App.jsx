import {Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OptionSelectionPage from './pages/OptionSelectionPage'
import LevelSelectionPage from './pages/LevelSelectionPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import { useParams } from 'react-router-dom';
import LevelTemplate from './components/LevelTemplate'
import CoursesPage from './pages/CoursesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import CourseCreationPage from './pages/CourseCreationPage'
import AdminCoursesPage from './pages/AdminCoursesPage'
import EditCoursePage from './pages/EditCoursePage'
import LessonCreationPage from './pages/LessonCreationPage'

function App() {
  return (
    <Routes>
      {/* Login screen */}
      <Route path="/" element={<LoginPage/>} />

      {/* option selection screen */}
      <Route path="/option-select" element={<OptionSelectionPage/>} />

      {/* level selection screen */}
      <Route path="/course/:courseId" element={<LevelSelectionPage/>} />

      {/* dashboard */}
      <Route path="/dashboard" element={<DashboardPage/>} />

      {/* register screen */}
      <Route path="/register" element={<RegisterPage/>} />

      {/*lesson level by id */}
      <Route path="/level/:lessonId" element={<LevelWrapper />} />

      {/* available courses list */}
      <Route path="/courses" element={<CoursesPage />} />

      <Route path="/course/:courseId/level/:levelNumber" element={<LevelTemplate />} />

      <Route path='/admin-dashboard' element={<AdminDashboardPage/>} />

      <Route path='/admin/create-course' element={<CourseCreationPage/>} />

      <Route path='/admin/courses' element={<AdminCoursesPage/>} />

      <Route path='/admin/edit-course/:id' element={<EditCoursePage/>} />

      <Route path='admin/create-lesson' element={<LessonCreationPage />} />

      {/* Error screen */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

function LevelWrapper() {
  // useParams() extracts the 'lessonId' from the URL
  const { lessonId } = useParams();
  
  return <LevelTemplate lessonId={Number(lessonId)} />; 
}

export default App
