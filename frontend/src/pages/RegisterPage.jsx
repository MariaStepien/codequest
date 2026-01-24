import { useState } from "react";
import { Loader2, ScrollText } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import TermsModal from "../components/TermsModal";

export default function RegisterPage() {
  const [userLogin, setUserLogin] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (userLogin.length < 4 || userLogin.length > 20) {
      setError("Nazwa użytkownika musi zawierać pomiędzy 4 a 20 znakami.");
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi zawierać conajmniej 8 znaków.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła się nie zgadzają.");
      return;
    }

    if (!acceptedTerms) {
      setError("Musisz zaakceptować regulamin, aby założyć konto.");
      return;
    }

    setIsLoading(true);

    const registerData = {
      userLogin,
      password,
    };

    const API_URL = "/api/auth/register"; 

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess("Rejestracja pomyślna! Przekierowywanie do logowania...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        if (typeof responseData === 'object' && !responseData.message) {
          const firstError = Object.values(responseData)[0];
          setError(firstError);
        } else {
            setError(responseData.message || "Błąd rejestracji");
        }
      }
    } catch (err) {
      console.error("Błąd sieciowy lub pobierania:", err);
      setError("Nie można nawiązać połączenia z serwerem. Sprawdź swoje połączenie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-red-500 p-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Utwórz swoje konto w CodeQuest
        </h2>
        
        {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {success}
            </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="userLogin" className="block text-sm font-medium text-gray-700 mb-2">
              Login / Nazwa użytkownika
            </label>
            <input
              id="userLogin"
              type="text"
              value={userLogin}
              onChange={(e) => setUserLogin(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Wybierz unikalną nazwę logowania"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Wprowadź hasło"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Powtórz hasło
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-5 py-3 text-lg border-2 border-transparent rounded-2xl shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none transition duration-300 text-gray-900"
              placeholder="Powtórz hasło"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition underline decoration-dotted"
            >
              <ScrollText className="w-4 h-4" />
              <span>{acceptedTerms ? "Regulamin zaakceptowany" : "Przeczytaj i zaakceptuj regulamin"}</span>
            </button>
            {acceptedTerms && (
                <span className="text-xs text-green-600 font-bold">✓ Regulamin został zaakceptowany</span>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 text-lg font-semibold text-white rounded-2xl transition duration-300 shadow-lg flex items-center justify-center space-x-2
              ${isLoading || !acceptedTerms
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-purple-500 hover:from-purple-700 hover:to-red-700'
              }`}
            disabled={isLoading || !acceptedTerms}
          >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rejestrowanie konta...</span>
                </>
            ) : (
                <span>Zarejestruj konto</span>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Masz już konto?{" "}
          <a href="/" className="text-pink-600 font-medium hover:underline">
            Zaloguj się tutaj
          </a>
        </p>
      </div>

      <TermsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        hasRead={hasRead}
        setHasRead={setHasRead}
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
      />
    </div>
  );
}