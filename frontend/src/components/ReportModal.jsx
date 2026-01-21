import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  "Spam",
  "Mowa nienawiści",
  "Nękanie",
  "Nieodpowiednie treści",
  "Błąd w zadaniu",
  "Inne"
];

const getTargetLabel = (type) => {
  switch (type) {
    case 'POST': return 'wpis';
    case 'COMMENT': return 'komentarz';
    case 'LESSON': return 'lekcję';
    default: return 'treść';
  }
};

export default function ReportModal({ show, onClose, onReport, targetType, targetId }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onReport({
      category,
      description,
      targetType,
      targetId
    });
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" /> Zgłoś {getTargetLabel(targetType)}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria</label>
            <select 
              className="text-black w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opis (opcjonalnie)</label>
            <textarea 
              className="text-black w-full border rounded-lg px-3 py-2 h-24 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Dlaczego zgłaszasz tę treść?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Anuluj
            </button>
            <button 
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Wyślij zgłoszenie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}