import { useState, useEffect } from 'react';
import { PackagePlus, X, CheckCircle, Upload } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function AddEquipmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ARMOR',
    cost: 100,
    itemNumber: 1
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState(null);

  const jwtToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/user/me', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (response.ok) setUserData(await response.json());
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, [jwtToken]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Proszę wybrać zdjęcie przedmiotu.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const data = new FormData();
    data.append('equipment', JSON.stringify(formData));
    data.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8080/api/equipment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: data
      });

      if (!response.ok) throw new Error('Nie udało się dodać przedmiotu.');

      setSuccess(`Przedmiot "${formData.name}" został pomyślnie dodany.`);
      setFormData({ name: '', type: 'ARMOR', cost: 100, itemNumber: formData.itemNumber + 1 });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <AdminSidebar userLogin={userData?.userLogin || "Admin"} currentPage="add-equipment" />
      
      <main className="md:ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <PackagePlus className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Dodaj Nowy Ekwipunek</h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-3" /> {success}
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center">
                <X className="w-5 h-5 mr-3" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nazwa przedmiotu</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="text-black w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  placeholder="np. Złoty Hełm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Typ</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="text-black w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="HELM">Hełm</option>
                  <option value="ARMOR">Zbroja</option>
                  <option value="WEAPON">Broń</option>
                  <option value="PANTS">Spodnie</option>
                  <option value="SHOES">Buty</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Koszt (monety)</label>
                <input 
                  type="number" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  min="0"
                  required 
                  className="text-black w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Numer przedmiotu (ID wizualne)</label>
                <input 
                  type="number" 
                  name="itemNumber" 
                  value={formData.itemNumber} 
                  onChange={handleChange} 
                  min="1"
                  required 
                  className="text-black w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Grafika przedmiotu</label>
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition ${previewUrl ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                  {previewUrl ? (
                    <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="h-40 object-contain" 
                    />
                    ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">Kliknij, aby wgrać grafikę</p>
                    </div>
                )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-400">Plik zostanie zapisany jako: <span className="font-mono">{formData.type.toLowerCase()}_{formData.itemNumber}.png</span></p>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-white font-bold text-lg shadow-lg transform transition active:scale-95 ${isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? 'Dodawanie...' : 'Dodaj przedmiot'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}