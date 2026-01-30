import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Filter, Calendar, Flag, MessageSquare, FileText, Eye, X, Trash2, BookOpen, Ban } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';

export default function ReportListPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTargetType, setFilterTargetType] = useState('ALL');
  const [sortDate, setSortDate] = useState('DESC');
  const [toast, setToast] = useState({ show: false, message: '', isError: false });
  const [adminData, setAdminData] = useState({ userLogin: "Admin", id: null });
  
  const [selectedReportContent, setSelectedReportContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null, 
    id: null,
    status: null,
    title: '',
    message: ''
  });

  const statusLabels = {
    'PENDING': 'Oczekujące',
    'RESOLVED': 'Rozwiązane',
    'DISMISSED': 'Odrzucone',
    'ALL': 'Wszystkie'
  };

  const targetTypeOptions = [
    { value: 'ALL', label: 'Wszystkie typy' },
    { value: 'POST', label: 'Wpisy' },
    { value: 'COMMENT', label: 'Komentarze' },
    { value: 'LESSON', label: 'Lekcje' }
  ];

  const triggerToast = (msg, err = false) => {
    setToast({ show: true, message: msg, isError: err });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 3000);
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
      }
    } catch (error) {
      console.error("Błąd pobierania danych admina", error);
    }
  };

  useEffect(() => {
      fetchReports(0);
  }, [filterStatus, filterTargetType, sortDate]);

  const fetchReports = async (page = 0) => {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(
              `/api/reports?status=${filterStatus}&targetType=${filterTargetType}&page=${page}&size=10&sort=createdAt,${sortDate}`, {
                headers: {'Authorization': `Bearer ${token}`}
              }  
          );
          const data = await response.json();
          
          setReports(data.content);
          setTotalPages(data.page.totalPages);
          setCurrentPage(data.page.number);
      } catch (error) {
          setToast({ show: true, message: 'Błąd ładowania zgłoszeń', isError: true });
      }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openConfirmStatusModal = (id, status) => {
    const isResolve = status === 'RESOLVED';
    setConfirmModal({
      show: true,
      type: 'STATUS',
      id,
      status,
      title: isResolve ? "Rozwiąż zgłoszenie" : "Odrzuć zgłoszenie",
      message: isResolve 
        ? "Czy na pewno chcesz oznaczyć to zgłoszenie jako rozwiązane?"
        : "Czy na pewno chcesz odrzucić to zgłoszenie?"
    });
  };

  const openDeleteConfirmModal = () => {
    setConfirmModal({
      show: true,
      type: 'DELETE',
      title: "Usuń treść",
      message: `Czy na pewno chcesz trwale usunąć ten ${selectedReportContent.contentType === 'POST' ? 'wpis' : 'komentarz'}? Tej operacji nie można cofnąć.`
    });
  };

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem('token');
    const { id, status } = confirmModal;
    try {
      const res = await fetch(`/api/reports/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: {'Authorization': `Bearer ${token}`}
      });
      if (res.ok) {
        triggerToast(`Zgłoszenie zostało zaktualizowane.`);
        setConfirmModal({ ...confirmModal, show: false });
        fetchReports();
      }
    } catch (error) {
      triggerToast("Błąd podczas aktualizacji statusu.", true);
    }
  };

  const handleDeleteContent = async () => {
    const token = localStorage.getItem('token');
    const type = selectedReportContent.contentType === 'POST' ? 'posts' : 'comments';
    const id = selectedReportContent.id;
    const userId = adminData.id;

    try {
      const res = await fetch(`/api/forum/${type}/${id}?userId=${userId}&isAdmin=true`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}`}
      });

      if (res.ok) {
        triggerToast("Treść została pomyślnie usunięta.");
        setIsModalOpen(false);
        setConfirmModal({ ...confirmModal, show: false });
        fetchReports();
      } else {
        triggerToast("Nie udało się usunąć treści.", true);
      }
    } catch (error) {
      triggerToast("Wystąpił błąd podczas usuwania.", true);
    }
  };

  const fetchReportedContent = async (report) => {
    setLoadingContent(true);
    try {
      const token = localStorage.getItem('token');
      if (report.targetType === 'LESSON') {
        const lessonRes = await fetch(`/api/lessons/${report.targetId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (lessonRes.ok) {
          const lessonData = await lessonRes.json();
          navigate(`/admin/preview-lesson/${lessonData.courseId}/level/${lessonData.orderIndex}`);
          return;
        } else {
          throw new Error("Nie udało się pobrać danych lekcji");
        }
      }
      const res = await fetch(`/api/reports/${report.id}/content`, {headers: {'Authorization': `Bearer ${token}`}});
      if (res.ok) {
        const data = await res.json();
        
        setSelectedReportContent({
          ...data,
          contentType: report.targetType,
          reportId: report.id
        });
        if (data === null) {
          triggerToast("Nie znaleziono zgłoszonej treści (mogła zostać już usunięta).", true);
        } else {
          setIsModalOpen(true);
        }
      } else {
        triggerToast("Nie znaleziono zgłoszonej treści (mogła zostać już usunięta).", true);
      }
    } catch (error) {
      triggerToast("Błąd podczas pobierania treści.", true);
    } finally {
      setLoadingContent(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'DISMISSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-left">
      <AdminSidebar userLogin={adminData.userLogin} currentPage="admin-reports" />
      <Toast {...toast} />
      
      <ConfirmationModal 
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.type === 'DELETE' ? handleDeleteContent : handleUpdateStatus}
        onCancel={() => setConfirmModal({ ...confirmModal, show: false })}
        confirmText={confirmModal.type === 'DELETE' ? "Usuń" : "Potwierdź"}
      />

      <main className="flex-1 md:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Flag className="w-8 h-8 text-indigo-600" />
                Zgłoszenia
              </h1>
              <p className="text-gray-500 mt-1">Zarządzaj zgłoszeniami treści z forum.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                <Filter className="w-4 h-4 text-gray-400 mr-2" />
                <select 
                  className="bg-transparent text-sm outline-none font-medium text-gray-700"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">{statusLabels.ALL}</option>
                  <option value="PENDING">{statusLabels.PENDING}</option>
                  <option value="RESOLVED">{statusLabels.RESOLVED}</option>
                  <option value="DISMISSED">{statusLabels.DISMISSED}</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm outline-none font-medium text-gray-700"
                    value={filterTargetType}
                    onChange={(e) => setFilterTargetType(e.target.value)}
                  >
                    {targetTypeOptions.map(tar => (
                      <option key={tar.value} value={tar.value}>
                        {tar.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <select 
                    className="bg-transparent text-sm outline-none font-medium text-gray-700"
                    value={sortDate}
                    onChange={(e) => setSortDate(e.target.value)}
                  >
                    <option value="DESC">Najnowsze</option>
                    <option value="ASC">Najstarsze</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Zgłoszono</th>
                  <th className="px-6 py-4">Autor zgłoszenia</th>
                  <th className="px-6 py-4">Typ obiektu</th>
                  <th className="px-6 py-4">Powód / Opis</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(report.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                          {report.reporter?.userLogin?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{report.reporter?.userLogin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.targetType === 'POST' 
                          ? 'bg-blue-100 text-blue-800' 
                          : report.targetType === 'LESSON'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}>
                        {report.targetType === 'POST' && <FileText className="w-3 h-3" />}
                        {report.targetType === 'LESSON' && <BookOpen className="w-3 h-3" />}
                        {report.targetType === 'COMMENT' && <MessageSquare className="w-3 h-3" />}
                        
                        {targetTypeOptions.find(opt => opt.value === report.targetType)?.label || report.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-gray-800">{report.category}</p>
                        <p className="text-xs text-gray-500 italic mt-0.5">
                          {report.description || 'Brak opisu dodatkowego.'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(report.status)}`}>
                        {statusLabels[report.status] || report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => fetchReportedContent(report)}
                          disabled={loadingContent}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Zobacz treść"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        {report.status === 'PENDING' ? (
                          <>
                            <button 
                              onClick={() => openConfirmStatusModal(report.id, 'RESOLVED')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Oznacz jako rozwiązane"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => openConfirmStatusModal(report.id, 'DISMISSED')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Odrzuć zgłoszenie"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center text-gray-400 text-xs italic px-2">
                            {report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString() : 'Zakończono'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center gap-2 mt-8">
                <button 
                  disabled={currentPage === 0}
                  onClick={() => fetchReports(currentPage - 1)}
                  className="text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                >
                  Poprzednia
                </button>
                <span className="text-gray-600 flex items-center px-4">
                  Strona {currentPage + 1} z {totalPages}
                </span>
                <button 
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => fetchReports(currentPage + 1)}
                  className=" text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                >
                  Następna
                </button>
              </div>
          </div>
        </div>
      </main>

      {isModalOpen && selectedReportContent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                {selectedReportContent.contentType === 'POST' && (
                  <FileText className="w-5 h-5 text-indigo-600" />
                )}
                {selectedReportContent.contentType === 'LESSON' && (
                  <BookOpen className="w-5 h-5 text-green-600" />
                )}
                {selectedReportContent.contentType === 'COMMENT' && (
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                )}

                <h2 className="font-bold text-gray-900">
                  Podgląd: {targetTypeOptions.find(opt => opt.value === selectedReportContent.contentType)?.label || selectedReportContent.contentType}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                    {selectedReportContent.author?.userLogin?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                    <p className="text-sm font-bold text-gray-900">{selectedReportContent.author?.userLogin}</p>
                    <p className="text-xs text-gray-500">
                        Utworzono: {new Date(selectedReportContent.createdAt).toLocaleString()}
                    </p>
                    </div>
                </div>
                <button 
                  onClick={openDeleteConfirmModal}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Usuń treść
                </button>
              </div>

              {selectedReportContent.contentType === 'POST' && (
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {selectedReportContent.title}
                </h3>
              )}

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedReportContent.content}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}