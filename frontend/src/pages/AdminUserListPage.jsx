import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { Ban, CheckCircle } from 'lucide-react';

export default function AdminUserListPage() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', isError: false });
    const [modal, setModal] = useState({ show: false, userId: null, isBlocked: false });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (page = 0) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/user/all?page=${page}&size=10`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            
            setUsers(data.content);
            setTotalPages(data.page.totalPages);
            setCurrentPage(data.page.number);
        } catch (error) {
            showToast("Błąd podczas ładowania użytkowników", true);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, isError = false) => {
        setToast({ show: true, message, isError });
        setTimeout(() => setToast({ ...toast, show: false }), 3000);
    };

    const handleToggleBlock = async () => {
        try {
            const response = await fetch(`/api/user/${modal.userId}/toggle-block`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                showToast(modal.isBlocked ? "Użytkownik odblokowany" : "Użytkownik zablokowany");
                fetchUsers();
            } else {
                throw new Error();
            }
        } catch (error) {
            showToast("Operacja nie powiodła się", true);
        } finally {
            setModal({ show: false, userId: null });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar userLogin={localStorage.getItem('userLogin')} currentPage="admin-users" />
            
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Zarządzanie Użytkownikami</h1>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Login</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Rola</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-800 font-medium">{user.login}</td>
                                        <td className="px-6 py-4 text-gray-600">{user.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {user.isBlocked ? 'ZABLOKOWANY' : 'AKTYWNY'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setModal({ show: true, userId: user.id, isBlocked: user.isBlocked })}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                                                }`}
                                            >
                                                {user.isBlocked ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-4">
                            <button 
                                disabled={currentPage === 0}
                                onClick={() => fetchUsers(currentPage - 1)}
                                className="text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                                >
                                Poprzednia
                                </button>
                                <span className="text-gray-600 flex items-center px-4">
                                Strona {currentPage + 1} z {totalPages}
                                </span>
                                <button 
                                disabled={currentPage >= totalPages - 1}
                                onClick={() => fetchUsers(currentPage + 1)}
                                className=" text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                                >
                                Następna
                                </button>
                        </div>
                    </div>
                </div>
            </main>

            <Toast {...toast} />
            
            <ConfirmationModal 
                show={modal.show}
                title={modal.isBlocked ? "Odblokuj użytkownika" : "Zablokuj użytkownika"}
                message={`Czy na pewno chcesz ${modal.isBlocked ? 'odblokować' : 'zablokować'} tego użytkownika?`}
                confirmText={modal.isBlocked ? "Odblokuj" : "Zablokuj"}
                onConfirm={handleToggleBlock}
                onCancel={() => setModal({ show: false, userId: null })}
            />
        </div>
    );
}