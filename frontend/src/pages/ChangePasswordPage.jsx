import { useState } from 'react';
import { Loader2, KeyRound } from 'lucide-react';
import Header from '../components/Header';

export default function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    if (passwords.newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Nowe hasło musi mieć co najmniej 8 znaków.' });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus({ type: 'error', message: 'Nowe hasła nie są identyczne.' });
      return;
    }

    if (passwords.newPassword === passwords.currentPassword) {
      setStatus({ type: 'error', message: 'Nowe hasło musi być inne niż obecne.' });
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Hasło zostało zmienione pomyślnie!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: data.message || 'Wystąpił błąd podczas zmiany hasła.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Błąd połączenia z serwerem.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="settings" />
      <main className="max-w-md mx-auto pt-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <KeyRound className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Zmień hasło</h2>
          </div>

          {status.message && (
            <div className={`p-4 rounded-xl mb-6 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Obecne hasło</label>
              <input
                type="password"
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                required
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nowe hasło</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Powtórz nowe hasło</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center space-x-2 disabled:bg-indigo-400"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Zaktualizuj hasło</span>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}