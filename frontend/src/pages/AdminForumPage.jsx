import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Trash2, ArrowLeft, ShieldAlert, UserX, UserCheck, Calendar, Edit2, Check, X, Plus, Send, Reply } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

export default function AdminForumPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [userData, setUserData] = useState({ id: null, login: "", role: 'ADMIN' });
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyValue, setReplyValue] = useState('');

  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editValue, setEditValue] = useState({ title: '', content: '' });

  const [modal, setModal] = useState({ show: false, type: null, id: null, message: '' });
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  const openModal = (type, id, extraInfo = '') => {
    let message = '';
    switch (type) {
        case 'post':
        message = 'Czy na pewno chcesz usunąć ten post?';
        break;
        case 'comment':
        message = 'Czy na pewno chcesz usunąć ten komentarz?';
        break;
        case 'user-block':
        message = `Czy na pewno chcesz zmienić status blokady użytkownika?`;
        break;
        default:
        message = 'Czy na pewno chcesz wykonać tę operację?';
    }
    setModal({ show: true, type, id, message });
    };

  const triggerToast = (msg, err = false) => {
    setToast({ show: true, message: msg, isError: err });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 3000);
  };

  useEffect(() => {
    fetchUserData();
    fetchPosts();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData({ ...data, userLogin: data.login });
      }
    } catch (error) {
      console.error("Błąd pobierania danych admina:", error);
    }
  };

  const fetchPosts = async (page = 0) => {
    try {
      const res = await fetch(`http://localhost:8080/api/forum/posts?page=${page}&size=10`);
      const data = await res.json();
      setPosts(data.content);
      setTotalPages(data.page.totalPages);
      setCurrentPage(data.page.number);
    } catch (error) {
      setToast({ show: true, message: error, isError: true });
    }
  };

    const fetchPostDetails = async (postId) => {
      const res = await fetch(`http://localhost:8080/api/forum/posts/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data);
      }
    };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
        const res = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}/comments?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newComment })
        });

        if (res.ok) {
            setNewComment('');
            triggerToast("Dodano komentarz administratora!");
            await fetchPostDetails(selectedPost.id);
        } else {
            triggerToast("Nie udało się dodać komentarza.", true);
        }
    } catch (error) {
        triggerToast("Błąd serwera.", true);
    }
  };

  const handleAddReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyValue.trim()) return;

    try {
        const res = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}/comments/${parentCommentId}/replies?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: replyValue })
        });

        if (res.ok) {
            setReplyValue('');
            setReplyingTo(null);
            triggerToast("Dodano odpowiedź administratora!");
            await fetchPostDetails(selectedPost.id);
        } else {
            triggerToast("Nie udało się dodać odpowiedzi.", true);
        }
    } catch (error) {
        triggerToast("Błąd serwera.", true);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const postData = { title: newPostTitle, content: newPostContent };
    try {
        const res = await fetch(`http://localhost:8080/api/forum/posts?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (res.ok) {
            setNewPostTitle('');
            setNewPostContent('');
            setShowCreateForm(false);
            triggerToast("Opublikowano post jako Administrator!");
            fetchPosts();
        } else {
            triggerToast("Nie udało się opublikować wpisu.", true);
        }
    } catch (error) {
        triggerToast("Błąd połączenia z serwerem.", true);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}?userId=${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValue)
      });
      if (res.ok) {
        setEditingPost(null);
        triggerToast("Zaktualizowano post!");
        fetchPostDetails(selectedPost.id);
        fetchPosts();
      }
    } catch (error) {
      triggerToast("Błąd podczas edycji wpisu.", true);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/forum/comments/${commentId}?userId=${userData.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            content: editValue.content
        })
        });

        if (res.ok) {
        setEditingComment(null);
        triggerToast("Zaktualizowano komentarz!");
        if (selectedPost) {
            fetchPostDetails(selectedPost.id);
        }
        } else {
        const errorData = await res.json();
        console.error("Błąd z serwera:", errorData);
        triggerToast("Błąd: " + (errorData.message || "Nie udało się edytować"), true);
        }
    } catch (error) {
        console.error("Błąd połączenia:", error);
        triggerToast("Błąd podczas edycji komentarza.", true);
    }
    };

    const commentTree = useMemo(() => {
    if (!selectedPost || !selectedPost.comments) return [];
    const map = {};
    const roots = [];

    selectedPost.comments.forEach(comment => {
        map[comment.id] = { ...comment, replies: [] };
    });

    selectedPost.comments.forEach(comment => {
        const parentId = comment.parentComment?.id || comment.parentCommentId;
        
        if (parentId) {
        const parent = map[parentId];
        if (parent) {
            parent.replies.push(map[comment.id]);
        }
        } else {
        roots.push(map[comment.id]);
        }
    });

    return roots;
    }, [selectedPost]);

  const handleConfirmedAction = async () => {
    const { type, id } = modal;
    const token = localStorage.getItem('token');
    try {
      let url = '';
      let method = 'DELETE';
      if (type === 'post' || type === 'comment') {
        url = `http://localhost:8080/api/forum/${type}s/${id}?userId=${userData.id}&isAdmin=true`;
      } else if (type === 'user-block') {
        url = `http://localhost:8080/api/user/${id}/toggle-block`;
        method = 'POST';
      }
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerToast("Operacja zakończona sukcesem.");
        if (type === 'post') {
          setSelectedPost(null);
          fetchPosts();
        } else {
          if (selectedPost) fetchPostDetails(selectedPost.id);
          if (type === 'user-block') fetchPosts();
        }
      }
    } catch (e) {
      triggerToast("Błąd połączenia.", true);
    }
    setModal({ show: false, type: null, id: null });
  };

  const renderComments = (comments, level = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`${level > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-200 flex justify-between items-start text-left">
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-600 flex items-center gap-2">
              {comment.author?.userLogin} 
              {comment.author?.isBlocked && <span className="text-[10px] bg-red-100 px-1 rounded text-red-800">ZABLOKOWANY</span>}
              <span className="text-gray-400 font-normal ml-auto text-xs">{new Date(comment.createdAt).toLocaleString()}</span>
            </p>
            {editingComment === comment.id ? (
              <div className="mt-2 flex gap-2">
                <input 
                  className="text-black flex-1 border rounded px-2 py-1 text-sm outline-none"
                  value={editValue.content}
                  onChange={(e) => setEditValue({...editValue, content: e.target.value})}
                />
                <button onClick={() => handleUpdateComment(comment.id)} className="text-green-600"><Check className="w-4 h-4"/></button>
                <button onClick={() => setEditingComment(null)} className="text-gray-400"><X className="w-4 h-4"/></button>
              </div>
            ) : (
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
            )}

            {!editingComment && (
              <button 
                onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyValue(''); }}
                className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" /> Odpowiedz
              </button>
            )}

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleAddReply(e, comment.id)} className="mt-3 flex gap-2">
                <input 
                  className="text-black flex-1 border rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="Napisz odpowiedź..."
                  value={replyValue}
                  onChange={(e) => setReplyValue(e.target.value)}
                  autoFocus
                  required
                />
                <button type="submit" className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
           <div className="flex gap-2 ml-4 shrink-0">
            <button 
                onClick={() => openModal('user-block', comment.author?.id, comment.author?.userLogin)} 
                className="text-gray-400 hover:text-orange-500 p-1" 
                title="Zablokuj/Odblokuj autora komentarza"
            >
                {comment.author?.isBlocked ? <UserCheck className="w-4 h-4"/> : <UserX className="w-4 h-4"/>}
            </button>

            {comment.author?.id === userData.id && !editingComment && (
              <button 
                onClick={() => { setEditValue({ content: comment.content }); setEditingComment(comment.id); }}
                className="text-gray-400 hover:text-indigo-600 p-1"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            <button 
                onClick={() => openModal('comment', comment.id)} 
                className="text-red-400 hover:text-red-600 p-1"
                title="Usuń komentarz"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            </div>
          </div>
        </div>
        {comment.replies && renderComments(comment.replies, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userLogin={userData.login} currentPage="forum" />
      <main className="flex-1 ml-64 p-8">
        <Toast {...toast} />
        <ConfirmationModal 
            show={modal.show} 
            message={modal.message}
            onConfirm={handleConfirmedAction}
            onCancel={() => setModal({ show: false, type: null, id: null, message: '' })}
        />

        <div className="max-w-4xl mx-auto text-left">
          {selectedPost ? (
            <div className="space-y-6">
              <button onClick={() => { setSelectedPost(null); setEditingPost(null); setReplyingTo(null); }} className="flex items-center text-indigo-600 hover:underline">
                <ArrowLeft className="w-4 h-4 mr-1" /> Powrót
              </button>
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
                {editingPost === selectedPost.id ? (
                  <form onSubmit={handleUpdatePost} className="space-y-3">
                    <input className="text-black w-full border rounded-lg px-4 py-2 outline-none" value={editValue.title} onChange={(e) => setEditValue({...editValue, title: e.target.value})} />
                    <textarea className="text-black w-full border rounded-lg px-4 py-2 h-32 outline-none" value={editValue.content} onChange={(e) => setEditValue({...editValue, content: e.target.value})} />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingPost(null)} className="p-2 text-gray-500"><X /></button>
                      <button type="submit" className="p-2 text-green-600"><Check /></button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-1">
                      <h1 className="text-3xl font-bold text-gray-900">{selectedPost.title}</h1>
                      <div className="flex gap-2 ml-4">
                        <div className="flex gap-2 ml-4">
                            <button 
                                onClick={() => openModal('user-block', selectedPost.author?.id, selectedPost.author?.userLogin)} 
                                className="text-gray-400 hover:text-orange-500 p-2"
                                title="Zablokuj/Odblokuj autora wpisu"
                            >
                                {selectedPost.author?.isBlocked ? <UserCheck className="w-5 h-5"/> : <UserX className="w-5 h-5"/>}
                            </button>

                            {selectedPost.author?.id === userData.id && (
                                <button onClick={() => { setEditValue({ title: selectedPost.title, content: selectedPost.content }); setEditingPost(selectedPost.id); }} className="text-gray-400 hover:text-indigo-600 p-2"><Edit2 className="w-5 h-5" /></button>
                            )}

                            <button 
                                onClick={() => openModal('post', selectedPost.id)} 
                                className="text-red-400 hover:text-red-600 p-2"
                                title="Usuń post"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">Autor: {selectedPost.author?.userLogin} • {new Date(selectedPost.createdAt).toLocaleString()}</p>
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</div>
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center"><MessageSquare className="w-5 h-4 mr-2" /> Komentarze</h3>
                
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input 
                    className="text-black flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Dodaj komentarz jako administrator..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  <button type="submit" className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700">
                    <Send className="w-5 h-5" />
                  </button>
                </form>

                <div className="space-y-2">
                  {renderComments(commentTree)}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShieldAlert className="text-red-600" /> Moderacja Forum
                </h1>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {showCreateForm && (
                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500 text-left">
                  <h2 className="text-xl font-bold mb-4">Nowy wpis administratora</h2>
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <input 
                      className="text-black w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="Tytuł wpisu" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      required
                    />
                    <textarea 
                      className="text-black w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="Treść wpisu..." 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      required
                    />
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Anuluj</button>
                      <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">Opublikuj post</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} onClick={() => fetchPostDetails(post.id)} className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer border border-gray-100 flex justify-between items-center text-left">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
                      <div className="flex items-center text-xs text-gray-400 gap-4">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>Autor: {post.author?.userLogin}</span>
                        <span className="flex items-center"><MessageSquare className="w-3 h-3 mr-1" /> {post.comments?.length || 0}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setModal({ show: true, type: 'post', id: post.id }); }} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-6 h-6" /></button>
                  </div>
                ))}
                <div className="flex justify-center gap-2 mt-8">
                  <button 
                    disabled={currentPage === 0}
                    onClick={() => fetchPosts(currentPage - 1)}
                    className="text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                  >
                    Poprzednia
                  </button>
                  <span className="text-gray-600 flex items-center px-4">
                    Strona {currentPage + 1} z {totalPages}
                  </span>
                  <button 
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => fetchPosts(currentPage + 1)}
                    className=" text-indigo-600 px-4 py-2 bg-white border rounded disabled:opacity-50"
                  >
                    Następna
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}