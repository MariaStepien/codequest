import {Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OptionSelectionPage from './pages/OptionSelectionPage'
import TestLevelPage from './pages/TestLevelPage'
import LevelSelectionPage from './pages/LevelSelectionPage'
import DashboardPage from './pages/DashboardPage'
import UserProfilePage from './pages/UserProfilePage'
import RegisterPage from './pages/RegisterPage'
import LevelOneTheAmuletOfCode from './pages/LevelOneTheAmuletOfCode'
import LessonPage from './pages/LessonPage'
import { useParams } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Login screen */}
      <Route path="/" element={<LoginPage/>} />

      {/* option selection screen */}
      <Route path="/test" element={<OptionSelectionPage/>} />

      {/* test level screen */}
      <Route path="/test-level" element={<TestLevelPage/>} />

      {/* level selection screen */}
      <Route path="/levels" element={<LevelSelectionPage/>} />

      {/* dashboard */}
      <Route path="/dashboard" element={<DashboardPage/>} />

      {/* user page */}
      <Route path="/user-info" element={<UserProfilePage/>} />

      {/* register screen */}
      <Route path="/register" element={<RegisterPage/>} />

      {/* first level screen */}
      <Route path="/level/1" element={<LevelOneTheAmuletOfCode/>} />

      {/*lesson level by id */}
      <Route path="/lesson/:lessonId" element={<LessonWrapper />} />

      {/* Error screen */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

function LessonWrapper() {
  // useParams() extracts the 'lessonId' from the URL
  const { lessonId } = useParams();
  
  // LessonPage expects a numeric ID, so we convert the string
  return <LessonPage lessonId={Number(lessonId)} />; 
}

export default App
