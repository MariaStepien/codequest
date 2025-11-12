import React, { useState } from 'react';
import { LogOut, Settings, BarChart3, BookOpenText, Code, Wrench, User, Users, Sun, Zap, Award, ArrowRight, BookOpen, Clock, CheckCircle } from 'lucide-react';

// Mock Data
const userData = {
  name: "Alex",
  progress: 70,
  currentCourse: "Python for Beginners",
  currentLesson: "Lesson 5: Loops and Iteration",
  courses: [
    { id: 1, title: "Python for Beginners", progress: 70, color: "blue", lessons: 20, hours: 15, status: 'In Progress' },
    { id: 2, title: "Modern JavaScript", progress: 45, color: "yellow", lessons: 30, hours: 25, status: 'In Progress' },
    { id: 3, title: "Advanced React Hooks", progress: 10, color: "purple", lessons: 15, hours: 10, status: 'Started' },
    { id: 4, title: "Introduction to HTML & CSS", progress: 100, color: "green", lessons: 10, hours: 5, status: 'Completed' },
    { id: 5, title: "Data Science with Pandas", progress: 0, color: "red", lessons: 40, hours: 30, status: 'Not Started' },
  ],
  streak: 15,
  xp: 1250,
  badges: 3,
};

// --- Reusable Components ---

// Reusable Progress Bar Component
const ProgressBar = ({ progress, color, title }) => (
  <div className="mb-2">
    <div className="flex justify-between text-sm font-medium mb-1">
      <span className="text-gray-700">{title}</span>
      <span className={`text-${color}-600`}>{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full bg-${color}-500 transition-all duration-700`} 
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Reusable Stat Card for Gamification
const StatCard = ({ value, label, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border border-${color}-200 bg-${color}-50`}>
    <Icon className={`w-6 h-6 mx-auto mb-1 text-${color}-600`} />
    <div className="text-2xl font-extrabold text-gray-900">{value}</div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

// Reusable Action Card for Recommendations
const ActionCard = ({ title, description, icon: Icon, color }) => (
  <div className={`flex items-center p-4 border rounded-xl bg-white hover:shadow-md transition duration-150 border-${color}-300 cursor-pointer`}>
    <div className={`p-3 rounded-full bg-${color}-100 mr-4`}>
      <Icon className={`w-6 h-6 text-${color}-600`} />
    </div>
    <div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
  </div>
);

// Reusable Community Post Card
const CommunityPost = ({ user, topic, likes, comments }) => (
    <div className="mb-3 p-3 border-b border-gray-100 last:border-b-0">
      <p className="text-gray-700 font-medium truncate">
        <span className="text-indigo-600 font-bold mr-1">@{user}:</span> {topic}
      </p>
      <div className="flex text-xs text-gray-400 mt-1 space-x-4">
        <span>❤️ {likes}</span>
        <span>💬 {comments}</span>
      </div>
    </div>
);

// --- Dashboard Content Component ---
const DashboardContent = ({ userData, handleNavigation }) => (
    <div className="space-y-8">
        {/* Welcome Message */}
        <div className="p-6 bg-white rounded-xl shadow-lg border-l-4 border-indigo-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userData.name} 👋
            </h2 >
            <p className="text-xl text-gray-600 font-medium">
                You’re <span className="text-indigo-600 font-extrabold">{userData.progress}%</span> through <span className="text-gray-800">{userData.currentCourse}</span>!
            </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Main Focus) - Span 2 columns on desktop */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Continue Learning Card */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-xl shadow-xl text-white">
                    <p className="text-sm font-semibold mb-2 opacity-80">
                        LATEST ACTIVITY
                    </p>
                    <h3 className="text-2xl font-bold mb-4">
                        {userData.currentCourse}: {userData.currentLesson}
                    </h3>
                    {/* Changed button to anchor tag pointing to /levels */}
                    <a 
                      href="/levels"
                      className="flex items-center space-x-2 bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-indigo-50 transition duration-150"
                    >
                        <span>Resume Learning</span>
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>

                {/* Progress Tracker / Enrolled Courses */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        Your Course Progress
                      </h3>
                      <button 
                        onClick={() => handleNavigation('courses')}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        View All Courses &rarr;
                      </button>
                    </div>

                    <div className="space-y-4">
                        {userData.courses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 3).map(course => (
                            <ProgressBar 
                                key={course.id}
                                title={course.title} 
                                progress={course.progress} 
                                color={course.color} 
                            />
                        ))}
                    </div>
                </div>

                {/* Recommended Next Steps */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        Recommended Next Steps
                    </h3 >
                    <div className="space-y-4">
                        <ActionCard 
                            title="Try today’s coding challenge"
                            description="Solve a short Python problem to earn extra XP."
                            icon={Code}
                            color="green"
                        />
                        <ActionCard 
                            title="Explore new courses in Web Dev"
                            description="Start learning React or Angular fundamentals."
                            icon={BookOpenText}
                            color="red"
                        />
                    </div>
                </div>
                
            </div>
            
            {/* Right Column (Gamification & Community) */}
            <div className="lg:col-span-1 space-y-8">
                
                {/* Streak / XP / Achievements */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        Gamification Stats
                    </h3 >
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <StatCard 
                            value={userData.streak} 
                            label="Day Streak" 
                            icon={Sun} 
                            color="orange"
                        />
                        <StatCard 
                            value={userData.xp} 
                            label="Total XP" 
                            icon={Zap} 
                            color="teal"
                        />
                        <StatCard 
                            value={userData.badges} 
                            label="Badges Earned" 
                            icon={Award} 
                            color="pink"
                        />
                    </div>
                </div>

                {/* Community Highlights */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        Community Highlights
                    </h3 >
                    <CommunityPost 
                        user="JaneDoe"
                        topic="Built a calculator app using pure JS, check it out!"
                        likes={45}
                        comments={12}
                    />
                    <CommunityPost 
                        user="CoderMax"
                        topic="Having trouble with asynchronous Python functions. Help?"
                        likes={10}
                        comments={8}
                    />
                </div>
            </div>
        </div>
    </div>
);


// --- Courses Page Component ---
const CoursesPage = ({ courses }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 border-b pb-4">
                All Enrolled Courses
            </h1 >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
};

// Reusable Course Card for Courses Page
const CourseCard = ({ course }) => {
    const { title, progress, color, lessons, hours, status } = course;
    
    // Determine the button text based on status
    const buttonText = status === 'Completed' 
        ? 'Review Course' 
        : status === 'Not Started' 
        ? 'Start Course'
        : 'Continue Learning';

    // Determine the status icon
    const StatusIcon = status === 'Completed' ? CheckCircle : BookOpen;
    const statusColor = status === 'Completed' ? 'text-green-600' : 'text-gray-500';

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition duration-300 transform hover:-translate-y-0.5 border border-gray-100">
            <h3 className={`text-xl font-bold mb-3 text-${color}-600`}>{title}</h3>
            
            <div className="mb-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                    <StatusIcon className={`w-4 h-4 mr-2 ${statusColor}`} />
                    <span>Status: {status}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>{lessons} Lessons</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    <span>~{hours} Hours</span>
                </div>
            </div>

            <ProgressBar title="Overall Progress" progress={progress} color={color} />

            {/* Changed button to anchor tag pointing to /levels */}
            <a 
                href="/levels"
                className={`mt-4 w-full flex justify-center items-center space-x-2 
                    ${status === 'Completed' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 
                    status === 'Not Started' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
                    'bg-indigo-500 text-white hover:bg-indigo-600'}
                    px-4 py-2 rounded-lg font-semibold transition duration-150 shadow-md`}
            >
                <span>{buttonText}</span>
                <ArrowRight className="w-5 h-5" />
            </a>
        </div>
    );
};


// Navigation Links Data (Updated to use 'id' for routing)
const navLinks = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'courses', name: 'Courses', icon: BookOpenText },
  { id: 'practice', name: 'Practice', icon: Code },
  { id: 'projects', name: 'Projects', icon: Wrench },
  { id: 'community', name: 'Community', icon: Users },
];


// Main Application Component
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for simple routing: 'dashboard' or 'courses'
  const [currentPage, setCurrentPage] = useState('dashboard'); 

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
    // Close mobile menu if implemented
    // setIsMobileMenuOpen(false); 
  };


  // Function to render the correct page component
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent userData={userData} handleNavigation={handleNavigation} />;
      case 'courses':
        return <CoursesPage courses={userData.courses} />;
      // Add cases for 'practice', 'projects', 'community' later if needed
      default:
        return <DashboardContent userData={userData} handleNavigation={handleNavigation} />;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* TAILWIND SAFELIST FIX: 
        This hidden div ensures Tailwind registers the necessary utility classes 
        that might be dynamically generated or purged by the JIT compiler.
      */}
      <div className="hidden">
        {/* Dynamic Text/Progress Colors */}
        <span className="text-blue-600 bg-blue-500 border-blue-200 bg-blue-50 border-blue-300 bg-blue-100"></span>
        <span className="text-yellow-600 bg-yellow-500 border-yellow-200 bg-yellow-50 border-yellow-300 bg-yellow-100"></span>
        <span className="text-purple-600 bg-purple-500 border-purple-200 bg-purple-50 border-purple-300 bg-purple-100"></span>
        <span className="text-green-600 bg-green-500 border-green-200 bg-green-50 border-green-300 bg-green-100"></span>
        <span className="text-red-600 bg-red-500 border-red-200 bg-red-50 border-red-300 bg-red-100"></span>
        <span className="text-orange-600 bg-orange-500 border-orange-200 bg-orange-50 border-orange-300 bg-orange-100"></span>
        <span className="text-teal-600 bg-teal-500 border-teal-200 bg-teal-50 border-teal-300 bg-teal-100"></span>
        <span className="text-pink-600 bg-pink-500 border-pink-200 bg-pink-50 border-pink-300 bg-pink-100"></span>
        
        {/* Course Card Button Colors (Static classes that were possibly being purged) */}
        <span className="bg-indigo-600 hover:bg-indigo-700 bg-indigo-500 hover:bg-indigo-600 bg-gray-200 text-gray-700 hover:bg-gray-300"></span>
      </div>


      {/* 1. Header (Persistent) */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          
          {/* Logo + App Name */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavigation('dashboard')}>
            <Zap className="text-indigo-600 w-7 h-7" />
            <span className="text-xl font-extrabold text-gray-900">
              CodeLaunch
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map(link => (
              <a 
                key={link.id}
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavigation(link.id); }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ease-in-out 
                  ${currentPage === link.id
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-inner' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </a>
            ))}
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100 transition duration-150"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <User className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20">
                <a href="#profile" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>
                <a href="#settings" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>
                <a href="#logout" className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* 2. Main Content Area (Dynamically Renders Page) */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}