import React, { useState } from 'react';
import { LogOut, Settings, User, Mail, Zap, Award, BarChart3, Clock, Lock, ChevronRight, BookOpenText } from 'lucide-react';

// Mock User Data
const profileData = {
  id: 1001,
  name: "Alex Johnson",
  username: "CodeAlex7",
  email: "alex.j@example.com",
  bio: "Aspiring full-stack developer focusing on Python and React. Currently tackling data structures and algorithms.",
  joinDate: "January 2024",
  avatarInitial: "A",
  stats: {
    totalXp: 1250,
    coursesCompleted: 3,
    badgesEarned: 5,
    longestStreak: 15,
  },
  recentActivity: [
    { type: 'Completed', detail: 'Lesson 4: Control Flow', course: 'Python for Beginners', date: '2 hours ago' },
    { type: 'Earned', detail: 'The "Algorithm Apprentice" Badge', course: 'Achievements', date: 'Yesterday' },
    { type: 'Started', detail: 'Modern JavaScript', course: 'New Course', date: '3 days ago' },
  ]
};

// Reusable Stat Card
const StatCard = ({ value, label, icon: Icon, color }) => (
  <div className={`p-4 rounded-xl border border-${color}-200 bg-${color}-50 shadow-sm transition duration-200 hover:scale-[1.02]`}>
    <Icon className={`w-6 h-6 mb-2 text-${color}-600`} />
    <div className="text-3xl font-extrabold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

// Main Profile Component
export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Zap className="text-indigo-600 w-7 h-7" />
            <span className="text-xl font-extrabold text-gray-900">
              CodeLaunch Profile
            </span>
          </div>
          <button className="flex items-center space-x-2 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 transition duration-150">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      {/* Main Profile Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header & Bio */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 border-t-4 border-indigo-500">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
            {profileData.avatarInitial}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-extrabold text-gray-900">{profileData.name}</h1>
            <p className="text-lg text-indigo-600 font-semibold mb-2">@{profileData.username}</p>
            <p className="text-gray-600 max-w-xl italic">"{profileData.bio}"</p>
            <p className="text-sm text-gray-400 mt-2">Member since {profileData.joinDate}</p>
          </div>

          {/* Action Button */}
          <button className="flex items-center space-x-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-yellow-500 transition duration-150">
            <Settings className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Grid Layout for Stats and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Stats) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gamification Stats */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Learning Statistics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard 
                  value={profileData.stats.totalXp} 
                  label="Total XP" 
                  icon={Zap} 
                  color="teal"
                />
                <StatCard 
                  value={profileData.stats.badgesEarned} 
                  label="Badges" 
                  icon={Award} 
                  color="pink"
                />
                <StatCard 
                  value={profileData.stats.longestStreak} 
                  label="Longest Streak" 
                  icon={Clock} 
                  color="orange"
                />
                <StatCard 
                  value={profileData.stats.coursesCompleted} 
                  label="Courses Finished" 
                  icon={BookOpenText} 
                  color="blue"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {profileData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition duration-150 hover:bg-gray-100 border border-gray-100">
                        <div className="flex items-center space-x-3">
                            {activity.type === 'Completed' && <BarChart3 className="w-5 h-5 text-green-500" />}
                            {activity.type === 'Earned' && <Award className="w-5 h-5 text-yellow-500" />}
                            {activity.type === 'Started' && <BookOpenText className="w-5 h-5 text-indigo-500" />}
                            <div>
                                <p className="font-medium text-gray-800">{activity.detail}</p>
                                <p className="text-xs text-gray-500">{activity.course}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400">{activity.date}</p>
                    </div>
                ))}
              </div>
            </div>

          </div>
          
          {/* Right Column (Settings/Account Info) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Account Information */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Account Details
              </h3>
              <SettingItem icon={User} label="Username" value={profileData.username} color="gray" />
              <SettingItem icon={Mail} label="Email Address" value={profileData.email} color="gray" />
              <SettingItem icon={Lock} label="Password" value="••••••••" action="Change" color="gray" />
            </div>
            
            {/* Notifications & Privacy */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                Privacy & Notifications
              </h3>
              <SettingItem icon={Bell} label="Notifications" value="On" action="Manage" color="gray" />
              <SettingItem icon={Users} label="Profile Visibility" value="Public" action="Change" color="gray" />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

const SettingItem = ({ icon: Icon, label, value, action, color }) => (
    <div className="flex justify-between items-center py-3 border-b last:border-b-0">
        <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 text-indigo-600`} /> 
            <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{value}</p>
            </div>
        </div>
        {action && (
            <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition duration-150">
                {action}
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        )}
    </div>
);

const Bell = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>;
const Users = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5m-1.4-3.414l-6.59-6.59M12 12l2-2m-8 8l2-2M18 12h-2m-4 0H8m-2 0H4"></path></svg>;