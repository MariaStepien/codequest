import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, X, Upload, CheckCircle, AlertTriangle, ArrowLeft, Edit2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function EditEquipmentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        type: 'ARMOR',
        cost: 0,
        itemNumber: 0
    });
    const [currentImgSource, setCurrentImgSource] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [userData, setUserData] = useState(null);
    const [maxAllowedNumber, setMaxAllowedNumber] = useState(null);

    const jwtToken = localStorage.getItem('token');

    const fetchMaxNumber = async (type) => {
        try {
            const response = await fetch(`/api/equipment/next-number/${type}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const nextAvailable = await response.json();
                setMaxAllowedNumber(nextAvailable);
            }
        } catch (err) {
            console.error("Błąd pobierania limitu numeracji:", err);
        }
    };

    useEffect(() => {
        if (formData.type) {
            fetchMaxNumber(formData.type);
        }
    }, [formData.type, jwtToken]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (userRes.ok) setUserData(await userRes.json());

                const equipRes = await fetch(`/api/equipment/${id}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (equipRes.ok) {
                    const data = await equipRes.json();
                    setFormData({
                        name: data.name,
                        type: data.type,
                        cost: data.cost,
                        itemNumber: data.itemNumber
                    });
                    setCurrentImgSource(data.imgSource);
                } else {
                    throw new Error("Nie znaleziono przedmiotu.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, jwtToken]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cost' || name === 'itemNumber' 
                ? (parseInt(value) || 0) 
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const data = new FormData();
        data.append('equipment', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
        if (selectedFile) {
            data.append('file', selectedFile);
        }

        try {
            const response = await fetch(`/api/equipment/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
                body: data
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/admin/equipment'), 2000);
            } else {
                const errData = await response.json();
                throw new Error(errData.message || "Błąd podczas zapisu.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-screen bg-gray-50">Ładowanie...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="admin-equipment" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-2xl mx-auto">
                    <div>
                        <button
                            onClick={() => navigate('/admin/equipment')}
                            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium">
                            <ArrowLeft className="w-5 h-5 mr-1" /> Wróć do listy przedmiotów
                        </button>
                    </div>

                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 pb-2">
                            <Edit2 className="inline-block w-8 h-8 mr-2 text-indigo-600"/> Edytuj przedmiot
                        </h1>
                        <p className="text-indigo-300 opacity-90">ID: {id}</p>
                    </header>

                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <p className="text-sm font-medium">Przedmiot został pomyślnie zaktualizowany!</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nazwa przedmiotu</label>
                                    <input 
                                        type="text" required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="text-black w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Typ</label>
                                    <select 
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="text-black w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                                    >
                                        <option value="HELM">Hełm</option>
                                        <option value="ARMOR">Zbroja</option>
                                        <option value="PANTS">Spodnie</option>
                                        <option value="SHOES">Buty</option>
                                        <option value="WEAPON">Broń</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Koszt</label>
                                    <input 
                                        type="number" required
                                        value={formData.cost}
                                        onChange={(e) => setFormData({...formData, cost: parseInt(e.target.value)})}
                                        className="text-black w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Numer przedmiotu (kolejność)
                                    </label>
                                    <input
                                        type="number"
                                        name="itemNumber"
                                        value={formData.itemNumber}
                                        onChange={handleChange}
                                        min="1"
                                        max={maxAllowedNumber || ""}
                                        className="text-black w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                                        required
                                    />
                                    {maxAllowedNumber && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Zmiana numeru nie zmienia nazwy pliku
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Grafika</label>
                                <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                                    <img 
                                        src={previewUrl || `/api/${currentImgSource}`} 
                                        alt="Podgląd" 
                                        className="h-32 object-contain mb-4"
                                    />
                                    <label className="cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition">
                                        <Upload className="w-4 h-4 inline mr-2" />
                                        Zmień grafikę
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center space-x-2 ${
                                    isSaving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                }`}
                            >
                                <Save className="w-5 h-5" />
                                <span>{isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}