import { useState, useEffect } from 'react';
import { Edit, Trash2} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:8080/api';

export default function EnemyListPage() {
    const navigate = useNavigate();
    const [enemies, setEnemies] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [modalConfig, setModalConfig] = useState({ show: false, enemyId: null, name: '' });
    const [toastConfig, setToastConfig] = useState({ show: false, message: '', isError: false });

    const jwtToken = localStorage.getItem('token');

    const showToast = (message, isError = false) => {
        setToastConfig({ show: true, message, isError });
        setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 3000);
    };

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

    const openDeleteModal = (id, name) => {
        setModalConfig({ show: true, enemyId: id, name });
    };

    const handleDeleteConfirm = async () => {
        const { enemyId } = modalConfig;
        setModalConfig({ show: false, enemyId: null, name: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/enemies/${enemyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (res.ok) {
                setEnemies(enemies.filter(e => e.id !== enemyId));
                showToast("Przeciwnik został usunięty");
            } else {
                showToast("Błąd podczas usuwania przeciwnika.", true);
            }
        } catch (err) {
            console.error(err);
            showToast("Wystąpił błąd połączenia.", true);
        }
    };

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
                        <button 
                            onClick={() => navigate('/admin/add-enemy')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
                        >
                            + Nowy Wróg
                        </button>
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
                                    {enemies.length > 0 ? (
                                        enemies.map((enemy) => (
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
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button 
                                                        onClick={() => navigate(`/admin/edit-enemy/${enemy.id}`)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                        title="Edytuj"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => openDeleteModal(enemy.id, enemy.name)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Usuń"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
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

            <ConfirmationModal 
                show={modalConfig.show}
                title="Usuwanie przeciwnika"
                message={`Czy na pewno chcesz usunąć przeciwnika: ${modalConfig.name}?`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setModalConfig({ show: false, enemyId: null, name: '' })}
                confirmText="Usuń"
            />

            <Toast 
                show={toastConfig.show}
                message={toastConfig.message}
                isError={toastConfig.isError}
            />
        </div>
    );
}