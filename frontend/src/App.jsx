import {Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OptionSelectionPage from './pages/OptionSelectionPage'
import TestLevelPage from './pages/TestLevelPage'
import LevelSelectionPage from './pages/LevelSelectionPage'
import DashboardPage from './pages/DashboardPage'
import UserProfilePage from './pages/UserProfilePage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <Routes>
      {/* Login screen */}
      <Route path="/" element={<LoginPage/>} />

      {/* option selection screen */}
      <Route path="/test" element={<OptionSelectionPage/>} />

      {/* option selection screen */}
      <Route path="/test-level" element={<TestLevelPage/>} />

      {/* option selection screen */}
      <Route path="/levels" element={<LevelSelectionPage/>} />

      
      {/* option selection screen */}
      <Route path="/dashboard" element={<DashboardPage/>} />

            
      {/* option selection screen */}
      <Route path="/user-info" element={<UserProfilePage/>} />

      {/* option selection screen */}
      <Route path="/register" element={<RegisterPage/>} />

      {/* Error screen */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

export default App
