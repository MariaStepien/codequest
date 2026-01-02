import { useState, useEffect, useCallback } from 'react';
import { Coins, X, Shirt, Zap, AlertTriangle } from 'lucide-react';
import Header from '../components/Header'; 

const API_BASE_URL = 'http://localhost:8080/api';

const EQUIPMENT_SLOTS = [
    { type: 'HELM', label: 'Hełm' },
    { type: 'ARMOR', label: 'Zbroja' },
    { type: 'PANTS', label: 'Spodnie' },
    { type: 'SHOES', label: 'Buty' },
    { type: 'WEAPON', label: 'Broń' },
];

const initialEquipmentState = {
    userLogin: "Guest",
    coins: 0,
    spriteNr: 1,
    spriteImgSource: null,
    helm: null,
    armor: null,
    pants: null,
    shoes: null,
    weapon: null,
    ownedEquipment: [],
};

const getCharacterSprite = (spriteImgSource) => {
    const fileName = spriteImgSource || 'sprite_1_1_1_1_1.png';

    try {
        return `${API_BASE_URL}/uploads/sprites/${fileName}`;
    } catch (error) {
        return new URL(`${API_BASE_URL}/uploads/sprites/sprite_1_1_1_1_1.png`, import.meta.url).href; 
    }
};

const getItemIcon = (imgSource) => {
    if (!imgSource) return '';

    try {
        return `${API_BASE_URL}/${imgSource}`;
    } catch (e) {
        return new URL(`${API_BASE_URL}/uploads/sprites/sprite_1_1_1_1_1.png`, import.meta.url).href;
    }
};

const InventoryItemCard = ({ item, isEquipped, onAction, userCoins }) => {
    const isOwned = item.isOwned;
    const canAfford = item.cost <= userCoins;

    let button;
    if (isOwned && isEquipped) {
        button = (
            <div
                className="w-full py-1 text-xs font-semibold bg-green-500 text-white flex items-center justify-center rounded-b-lg cursor-not-allowed"
                title="Przedmiot już założony"
            >
                Założone
            </div>
        );
    } else if (isOwned) {
        button = (
            <button 
                onClick={() => onAction('EQUIP', item.id)}
                className="w-full py-1 text-xs font-semibold bg-indigo-500 text-white flex items-center justify-center rounded-b-lg hover:bg-indigo-600 transition"
            >
                Załóż
            </button>
        );
    } else {
        button = (
            <button 
                onClick={() => onAction('BUY', item.id)}
                disabled={!canAfford}
                className={`w-full py-1 text-xs font-semibold flex items-center justify-center rounded-b-lg transition 
                            ${canAfford ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
                Kup ({item.cost})
            </button>
        );
    }

    return (
        <div className={`flex flex-col rounded-lg shadow-md overflow-hidden transition duration-200 
                         ${isEquipped ? 'border-2 border-green-500' : 'border border-gray-200 bg-white hover:shadow-lg'}`}> 
            <div className="p-2 flex-grow">
                <div className="w-full h-20 flex items-center justify-center bg-gray-100 rounded-md mb-2">
                    <img 
                        src={getItemIcon(item.imgSource, item.type)} 
                        alt={item.name} 
                        className="max-w-full max-h-full object-contain" 
                    />
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate" title={item.name}>
                    {item.name}
                </p>
                <p className="text-xs text-gray-500 uppercase">{item.type}</p>
            </div>
            <div className="h-8">
                {button}
            </div>
        </div>
    );
};


export default function EquipmentPage() { 
    const [equipmentData, setEquipmentData] = useState(initialEquipmentState); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [activeTab, setActiveTab] = useState("HELM");
    const [tabItems, setTabItems] = useState([]);

    const userId = localStorage.getItem('userId');
    const jwtToken = localStorage.getItem('token');
    const userLogin = localStorage.getItem('userLogin') || "Guest";

    const fetchEquipment = useCallback(async () => {
        if (!userId || !jwtToken) return;

        setIsLoading(true);
        try {
            const equipmentResponse = await fetch(`http://localhost:8080/api/user-equipment/${userId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
            });

            const userResponse = await fetch('http://localhost:8080/api/user/me', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
            });

            const userDetails = await userResponse.json();

            if (!equipmentResponse.ok) {
                setEquipmentData(prev => ({
                    ...initialEquipmentState,
                    userLogin: userDetails.userLogin || userLogin,
                    coins: userDetails.coins || 0
                }));
            } else {
                const equipmentDetails = await equipmentResponse.json();
                setEquipmentData({
                    ...equipmentDetails,
                    userLogin: userDetails.userLogin,
                    coins: userDetails.coins,
                });
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [userId, jwtToken, userLogin]);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    const fetchItemsByType = useCallback(async (type) => {
        try {
            const response = await fetch(`http://localhost:8080/api/equipment/type/${type}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Nie udało się pobrać przedmiotów.");

            const data = await response.json();
            setTabItems(data);

        } catch (error) {
            console.error(error);
        }
    }, [jwtToken]);

    useEffect(() => {
        fetchItemsByType(activeTab);
    }, [activeTab, fetchItemsByType]);

    const handleEquipmentAction = async (action, itemId, slotType) => {
        let url = '';
        let method = 'PUT';
        let successMsg = '';

        if (!userId || !jwtToken) return;

        switch (action) {
            case 'EQUIP':
                url = `http://localhost:8080/api/user-equipment/equip/${userId}/${itemId}`;
                successMsg = "Pomyślnie założono przedmiot!";
                break;
            case 'UNEQUIP':
                url = `http://localhost:8080/api/user-equipment/unequip/${userId}/${slotType}`;
                method = 'PUT';
                successMsg = "Pomyślnie zdjęto przedmiot.";
                break;
            case 'BUY':
                url = `http://localhost:8080/api/user-bought-equipment/buy/${userId}/${itemId}`;
                method = 'POST';
                successMsg = "Pomyślnie zakupiono przedmiot!";
                break;
            default:
                return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${jwtToken}` },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Błąd: ${response.status}. ${errorText || "Nieznany błąd serwera."}`);
            }

            setMessage(successMsg);
            await fetchEquipment();
            setTimeout(() => setMessage(null), 3000);

        } catch (err) {
            console.error(`Błąd podczas ${action}:`, err);
            setError(err.message);
            setTimeout(() => setError(null), 5000);
        }
    };

    if (isLoading) return <div className="text-center py-10 text-xl font-medium">Ładowanie...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header userLogin={equipmentData.userLogin || userLogin} currentPage={'equipment'} />

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

                {message && (
                    <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 font-medium flex items-center">
                        <Zap className="w-5 h-5 mr-2" /> {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 font-medium flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-5">
                        <div className="p-4 rounded-xl border border-gray-300 bg-white shadow-lg">
                            <div className="text-xl font-bold text-gray-800 flex items-center mb-4">
                                <Coins className="w-6 h-6 mr-2 text-yellow-500" />
                                Monety: {equipmentData.coins}
                            </div>

                            <div className="w-full aspect-square rounded-lg flex items-center justify-center p-2">
                                <img 
                                    src={getCharacterSprite(equipmentData.spriteImgSource)}
                                    alt="Postać" 
                                    className="max-w-full max-h-full object-contain" 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-500">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ekwipunek</h2>
                            <p className="text-sm text-gray-600 mb-6">Kliknij zakładkę, aby wyświetlić przedmioty danej kategorii.</p>

                            <div className="grid grid-cols-5 gap-2 mb-6"> 
                                {EQUIPMENT_SLOTS.map(slot => (
                                    <button
                                        key={slot.type}
                                        onClick={() => setActiveTab(slot.type)}
                                        className={`w-full px-2 py-2 rounded-lg font-semibold text-sm transition border
                                            ${activeTab === slot.type
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'}`}
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {tabItems.length > 0 ? (
                                    tabItems.map(item => {
                                        
                                        const currentItemId = Number(item.id); 

                                        const isEquipped = (() => {
                                            switch (item.type) {
                                                case 'HELM':
                                                    return Number(equipmentData.helm?.id) === currentItemId;
                                                case 'ARMOR':
                                                    return Number(equipmentData.armor?.id) === currentItemId;
                                                case 'PANTS':
                                                    return Number(equipmentData.pants?.id) === currentItemId;
                                                case 'SHOES':
                                                    return Number(equipmentData.shoes?.id) === currentItemId;
                                                case 'WEAPON':
                                                    return Number(equipmentData.weapon?.id) === currentItemId;
                                                default:
                                                    return false;
                                            }
                                        })();
                                        
                                        return (
                                            <InventoryItemCard
                                                key={item.id}
                                                item={{
                                                    ...item,
                                                    isOwned: equipmentData.ownedEquipment.some(o => Number(o.id) === currentItemId),
                                                    isEquipped: isEquipped, 
                                                }}
                                                userCoins={equipmentData.coins}
                                                onAction={handleEquipmentAction}
                                                isEquipped={isEquipped}
                                            />
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 col-span-full text-center">
                                        Brak przedmiotów w tej kategorii.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}