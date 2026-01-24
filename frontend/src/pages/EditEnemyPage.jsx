import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Upload, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function EditEnemyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [currentImg, setCurrentImg] = useState('');
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

                const enemyRes = await fetch(`/api/enemies/${id}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (enemyRes.ok) {
                    const data = await enemyRes.json();
                    setName(data.name);
                    setCurrentImg(data.imgSource);
                } else {
                    navigate('/admin/enemies');
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id, jwtToken, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        const formData = new FormData();
        formData.append('name', name);
        if (selectedFile) formData.append('file', selectedFile);

        try {
            const res = await fetch(`/api/enemies/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${jwtToken}` },
                body: formData
            });

            if (res.ok) {
                setStatus({ loading: false, error: null, success: true });
                setTimeout(() => navigate('/admin/enemies'), 1500);
            } else {
                const msg = await res.text();
                throw new Error(msg || "Błąd podczas edycji");
            }
        } catch (err) {
            setStatus({ loading: false, error: err.message, success: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="enemy-list" />
            
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => navigate('/admin/enemies')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Powrót do listy
                    </button>

                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Edit className="w-8 h-8" /></div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edytuj Przeciwnika</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Nazwa Przeciwnika</label>
                            <input 
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-black w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Grafika (Pozostaw puste, aby nie zmieniać)</label>
                            <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition ${previewUrl ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="New Preview" className="h-full object-contain p-4" />
                                ) : (
                                    <div className="text-center">
                                        <img src={`/api/${currentImg}`} alt="Current" className="h-32 mx-auto mb-2 object-contain opacity-50" />
                                        <p className="text-sm text-gray-500">Kliknij, aby zmienić grafikę</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {status.error && <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> {status.error}</div>}
                        {status.success && <div className="p-4 bg-green-50 text-green-600 rounded-xl flex items-center"><CheckCircle className="w-5 h-5 mr-2"/> Zmiany zapisane! Przekierowywanie...</div>}

                        <button 
                            type="submit"
                            disabled={status.loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                        >
                            {status.loading ? "Zapisywanie..." : "Zaktualizuj Przeciwnika"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}