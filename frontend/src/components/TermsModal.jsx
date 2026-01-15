import { useRef } from "react";
import { X } from "lucide-react";

export default function TermsModal({ 
  isOpen, 
  onClose, 
  hasRead, 
  setHasRead, 
  acceptedTerms, 
  setAcceptedTerms 
}) {
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasRead(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Regulamin serwisu CodeQuest</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-6 overflow-y-auto text-gray-600 space-y-4 text-sm leading-relaxed"
        >
          <section>
            <h4 className="font-bold text-gray-800 mb-1">1. Zasady Nazewnictwa</h4>
            <p>Użytkownik zobowiązuje się do nieużywania nazw (loginów), które są wulgarne, obraźliwe, rasistowskie lub naruszają godność innych osób.</p>
          </section>
          
          <section>
            <h4 className="font-bold text-gray-800 mb-1">2. Publikacja Treści</h4>
            <p>Zabrania się umieszczania na forum oraz w innych sekcjach serwisu treści będących spamem, materiałami reklamowymi lub treściami o charakterze wulgarnym.</p>
          </section>
          
          <section>
            <h4 className="font-bold text-gray-800 mb-1">3. Moderacja i Blokady</h4>
            <p>Administrator serwisu zastrzega sobie prawo do zablokowania lub usunięcia konta użytkownika w przypadku stwierdzenia naruszenia powyższych zasad.</p>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 mb-1">4. Odpowiedzialność</h4>
            <p>Użytkownik ponosi pełną odpowiedzialność za treści publikowane z jego konta.</p>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 mb-1">5. Odpowiedzialność techniczna</h4>
            <p>Administrator dokłada wszelkich starań, aby serwis działał bezawaryjnie, jednak nie ponosi odpowiedzialności za przerwy w dostępie oraz utratę danych wynikającą z awarii technicznych.</p>
          </section>
          
          <div className="h-4"></div>
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-3xl">
          <label className={`flex items-center space-x-3 p-3 rounded-xl transition ${!hasRead ? 'opacity-40' : 'hover:bg-gray-100 cursor-pointer'}`}>
            <input 
              type="checkbox" 
              disabled={!hasRead}
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Akceptuję postanowienia regulaminu
            </span>
          </label>
          
          {!hasRead && (
            <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
              Musisz przewinąć regulamin do samego końca, aby go zaakceptować.
            </p>
          )}
          
          <button 
            onClick={onClose}
            className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition shadow-md"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}