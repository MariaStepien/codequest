import { useState, useEffect } from 'react';
import {Search, Edit, Skull} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { Navigate, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api';

export default function EnemyListPage() {
    const navigate = useNavigate();
    const [enemies, setEnemies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const jwtToken = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (userRes.ok) setUserData(await userRes.json());

                const enemyRes = await fetch(`${API_BASE_URL}/enemies`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (enemyRes.ok) {
                    const data = await enemyRes.json();
                    setEnemies(data);
                }
            } catch (err) {
                console.error("Błąd podczas pobierania danych:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [jwtToken]);

    const filteredEnemies = enemies.filter(enemy => 
        enemy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="enemy-list" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Lista Przeciwników</h1>
                            <p className="text-gray-500">Zarządzaj bazą potworów w grze</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input 
                                type="text"
                                placeholder="Szukaj przeciwnika..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20 text-gray-500">Ładowanie przeciwników...</div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Podgląd</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nazwa</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Ścieżka pliku</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredEnemies.length > 0 ? (
                                        filteredEnemies.map((enemy) => (
                                            <tr key={enemy.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                        <img 
                                                            src={`${API_BASE_URL}/${enemy.imgSource}`} 
                                                            alt={enemy.name}
                                                            className="w-10 h-10 object-contain"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-500">#{enemy.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{enemy.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">{enemy.imgSource}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => navigate(`/admin/edit-enemy/${enemy.id}`)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                                Nie znaleziono żadnych przeciwników.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}