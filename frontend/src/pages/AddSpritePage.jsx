import { useState, useEffect } from 'react';
import { Upload, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const EQUIPMENT_LABELS = {
    HELM: 'Hełm',
    ARMOR: 'Zbroja',
    PANTS: 'Spodnie',
    SHOES: 'Buty',
    WEAPON: 'Broń'
};

export default function AddSpritePage() {
    const [equipment, setEquipment] = useState({ HELM: [], ARMOR: [], PANTS: [], SHOES: [], WEAPON: [] });
    const [selections, setSelections] = useState({ HELM: '', ARMOR: '', PANTS: '', SHOES: '', WEAPON: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [userData, setUserData] = useState(null);

    const jwtToken = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (userRes.ok) setUserData(await userRes.json());

                const equipRes = await fetch(`/api/equipment`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                const data = await equipRes.json();
                
                const organized = data.reduce((acc, item) => {
                    if (acc[item.type]) {
                        acc[item.type].push(item);
                    }
                    return acc;
                }, { HELM: [], ARMOR: [], PANTS: [], SHOES: [], WEAPON: [] });
                
                setEquipment(organized);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        fetchData();
    }, [jwtToken]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setStatus({ ...status, error: "Wybierz plik graficzny" });

        setStatus({ loading: true, error: null, success: false });
        const formData = new FormData();
        formData.append('helmId', selections.HELM);
        formData.append('armorId', selections.ARMOR);
        formData.append('pantsId', selections.PANTS);
        formData.append('shoesId', selections.SHOES);
        formData.append('weaponId', selections.WEAPON);
        formData.append('file', selectedFile);

        try {
            const res = await fetch(`/api/sprites/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
                body: formData
            });

            if (res.ok) {
                setStatus({ loading: false, error: null, success: true });
                setSelections({ HELM: '', ARMOR: '', PANTS: '', SHOES: '', WEAPON: '' });
                setSelectedFile(null);
                setPreviewUrl(null);
            } else {
                throw new Error("Błąd podczas przesyłania.");
            }
        } catch (err) {
            setStatus({ loading: false, error: err.message, success: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="add-sprite" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Dodaj sprite postaci</h1>
                        <p className="text-gray-500">Powiąż plik graficzny z konkretną kombinacją ekwipunku</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <h2 className="font-bold text-lg mb-4">Wybierz kombinację</h2>
                            
                            {Object.entries(EQUIPMENT_LABELS).map(([key, label]) => (
                                <div key={key}>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                        {label}
                                    </label>
                                    <select 
                                        required
                                        value={selections[key]}
                                        onChange={(e) => setSelections({...selections, [key]: e.target.value})}
                                        className="text-black w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Wybierz {label.toLowerCase()}...</option>
                                        {equipment[key]?.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (nr: {item.itemNumber})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-lg mb-4">Plik Sprite</h2>
                                <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition ${previewUrl ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Wgraj sprite .png</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/png" onChange={handleFileChange} />
                                </label>
                            </div>

                            {status.error && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {status.error}</div>}
                            {status.success && <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center"><CheckCircle className="w-5 h-5 mr-2"/> Sprite zapisany pomyślnie!</div>}

                            <button 
                                type="submit"
                                disabled={status.loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
                            >
                                {status.loading ? "Przesyłanie..." : "Zapisz Sprite"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}