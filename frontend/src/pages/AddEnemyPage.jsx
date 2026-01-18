import { useState, useEffect } from 'react';
import { Skull, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

const API_BASE_URL = 'http://localhost:8080/api';

export default function AddEnemyPage() {
    const [name, setName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [userData, setUserData] = useState(null);

    const jwtToken = localStorage.getItem('token');

    useEffect(() => {
        fetch(`${API_BASE_URL}/user/me`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        })
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => console.error(err));
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
        if (!selectedFile) return setStatus({ ...status, error: "Wgraj grafikę przeciwnika" });

        setStatus({ loading: true, error: null, success: false });
        const formData = new FormData();
        formData.append('name', name);
        formData.append('file', selectedFile);

        try {
            const res = await fetch(`${API_BASE_URL}/enemies`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
                body: formData
            });

            if (res.ok) {
                setStatus({ loading: false, error: null, success: true });
                setName('');
                setSelectedFile(null);
                setPreviewUrl(null);
            } else {
                const errorMessage = await res.text();
                throw new Error(errorMessage);
            }
        } catch (err) {
            setStatus({ loading: false, error: err.message, success: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="add-enemy" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-2xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold mb-8 text-gray-900 pb-2">
                            <Skull className="inline-block w-8 h-8 mr-2 text-red-600"/> Dodaj przeciwnika
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nazwa Przeciwnika</label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-black w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
                                placeholder="np. Mroczny Rycerz"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Grafika (PNG)</label>
                            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition ${previewUrl ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="h-full object-contain p-4" />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Kliknij, aby wybrać plik</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {status.error && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {status.error}</div>}
                        {status.success && <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center"><CheckCircle className="w-5 h-5 mr-2"/> Przeciwnik dodany pomyślnie!</div>}

                        <button 
                            type="submit"
                            disabled={status.loading}
                            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition active:scale-[0.98] disabled:bg-gray-400"
                        >
                            {status.loading ? "Zapisywanie..." : "Dodaj Przeciwnika"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}