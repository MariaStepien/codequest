import { useState, useEffect } from 'react';
import { Award, Trophy } from 'lucide-react';
import Header from '../components/Header';

const initialRankingEntry = {
    userId: null,
    userLogin: 'Ładowanie...',
    points: 0,
    rank: 0,
};

const RankingRow = ({ entry, isCurrentUser }) => {
    
    const baseClasses = "flex justify-between items-center p-4 border-b transition duration-150";
    
    const highlightClasses = isCurrentUser 
        ? "bg-indigo-100 border-indigo-500 font-bold text-indigo-800 shadow-md scale-[1.01] hover:scale-[1.02]" 
        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700";

    const renderRank = () => {
        if (entry.rank === 1) {
            return <Trophy className="w-6 h-6 text-yellow-500" />;
        }
        if (entry.rank === 2) {
            return <Trophy className="w-6 h-6 text-gray-400" />;
        }
        if (entry.rank === 3) {
            return <Trophy className="w-6 h-6 text-amber-600" />;
        }
        return <span className="text-xl font-extrabold w-6 text-center">{entry.rank}</span>;
    };

    return (
        <div className={`${baseClasses} ${highlightClasses}`}>
            <div className="w-1/6 flex justify-center items-center">
                {renderRank()}
            </div>
            
            <div className="w-7/12 text-left truncate">
                {entry.userLogin} {isCurrentUser && <span className="text-xs font-normal italic">(Ty)</span>}
            </div>

            <div className="w-1/4 text-right flex items-center justify-end space-x-2">
                <Award className="w-4 h-4 text-teal-500" />
                <span className="font-mono text-lg">{entry.points}</span>
            </div>
        </div>
    );
};


export default function RankingPage() {
    const [currentPage] = useState('ranking'); 
    const [globalRanking, setGlobalRanking] = useState([]);
    const [userRankEntry, setUserRankEntry] = useState(initialRankingEntry);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) {
            setError("Brak tokenu uwierzytelniającego.");
            setIsLoading(false);
            return;
        }

        const headers = {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        };

        const fetchRankingData = async () => {
            try {
                const userRankResponse = await fetch('http://localhost:8080/api/ranking/me', { headers });
                if (userRankResponse.ok) {
                    const data = await userRankResponse.json();
                    setUserRankEntry(data);
                }
                
                const globalRankResponse = await fetch('http://localhost:8080/api/ranking/global', { headers });
                
                if (!globalRankResponse.ok) {
                    throw new Error('Nie udało się pobrać globalnego rankingu.');
                }
                
                const globalData = await globalRankResponse.json();
                setGlobalRanking(globalData);

            } catch (err) {
                console.error("Błąd podczas pobierania rankingu:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankingData();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center py-10 text-lg">Ładowanie rankingu...</div>;
        }

        if (error) {
            return <div className="text-center py-10 text-lg text-red-600">Błąd: {error}</div>;
        }

        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-indigo-600">
                    <h2 className="text-xl font-semibold mb-3 text-indigo-700">Twoje miejsce w rankingu</h2>
                    <RankingRow 
                        entry={userRankEntry} 
                        isCurrentUser={true}
                    />
                </div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <h2 className="text-2xl font-bold p-4 bg-gray-50 border-b text-gray-900">
                        <Award className="inline w-6 h-6 mr-2 text-red-500" />
                        Globalny Ranking Użytkowników
                    </h2>
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-500 px-4 py-2 border-b bg-gray-100">
                        <div className="w-1/6 text-center">#</div>
                        <div className="w-7/12 text-left">Login</div>
                        <div className="w-1/4 text-right">Punkty</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {globalRanking.map((entry) => (
                            <RankingRow
                                key={entry.userId}
                                entry={entry}
                                isCurrentUser={entry.userId === userRankEntry.userId}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header
                userLogin={userRankEntry.userLogin} 
                currentPage={currentPage}
            />
            
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {renderContent()}
            </main>
        </div>
    );
}