import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Edit2, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE_URL = 'http://localhost:8080/api';

const EQUIPMENT_SLOTS = [
    { type: 'HELM', label: 'Hełm' },
    { type: 'ARMOR', label: 'Zbroja' },
    { type: 'PANTS', label: 'Spodnie' },
    { type: 'SHOES', label: 'Buty' },
    { type: 'WEAPON', label: 'Broń' },
];

export default function AdminEquipmentListPage() {
    const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ARMOR');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    
    const navigate = useNavigate();
    const jwtToken = localStorage.getItem('token');

    const fetchItems = useCallback(async (category) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/equipment/type/${category}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                setItems(await response.json());
            } else if (response.status === 404) {
                setItems([]);
            } else {
                throw new Error('Błąd pobierania danych.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [jwtToken]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (response.ok) setUserData(await response.json());
            } catch (err) { console.error(err); }
        };
        
        fetchUser();
        fetchItems(activeCategory);
    }, [jwtToken, activeCategory, fetchItems]);

    const getItemIcon = (imgSource) => {
        if (!imgSource) return '';
        return `${API_BASE_URL}/${imgSource}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="admin-equipment" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Zarządzanie Ekwipunkiem</h1>
                            <p className="text-gray-500">Przeglądaj i edytuj przedmioty dostępne do zakupu przez użytkownika</p>
                        </div>
                        <button 
                            onClick={() => navigate('/admin/add-equipment')}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Dodaj Nowy</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Item type selection */}
                        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
                            {EQUIPMENT_SLOTS.map(slot => (
                                <button
                                    key={slot.type}
                                    onClick={() => setActiveCategory(slot.type)}
                                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                                        activeCategory === slot.type
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">Ładowanie przedmiotów...</div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> {error}
                            </div>
                        ) : items.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {items.map(item => (
                                    <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                                        <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center p-2">
                                            <img 
                                                src={getItemIcon(item.imgSource)} 
                                                alt={item.name} 
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Koszt: {item.cost} monet</p>
                                            <p className="text-xs text-gray-400">Nr: {item.itemNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/edit-equipment/${item.id}`)}
                                            className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edytuj</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                Brak przedmiotów w tej kategorii.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}