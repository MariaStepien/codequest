import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Trash2, ArrowLeft, Send, Plus, Edit2, Check, X, Reply, Flag } from 'lucide-react';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import ReportModal from '../components/ReportModal';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editValue, setEditValue] = useState({ title: '', content: '' });

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyValue, setReplyValue] = useState('');

  const [modal, setModal] = useState({show: false, type: null, id: null});
  const [reportData, setReportData] = useState({ show: false, targetType: '', targetId: null });
  const [toast, setToast] = useState({show: false, message: '', isError: false});

  const [userData, setUserData] = useState({
      id: null,
      userLogin: "Gość",
      role: 'USER'
    });

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
      const res = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error);
    }
  }

  const fetchPosts = async (page = 0) => {
    try {
      const res = await fetch(`/api/forum/posts?page=${page}&size=10`);
      const data = await res.json();
      setPosts(data.content);
      setTotalPages(data.page.totalPages);
      setCurrentPage(data.page.number);
    } catch (error) {
      setToast({ show: true, message: error, isError: true });
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
        const res = await fetch(`/api/forum/posts/${postId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedPost(data);
        }
    } catch (error) {
        console.error("Błąd odświeżania wpisu:", error);
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const postData = { title: newPostTitle, content: newPostContent };
    try {
        const res = await fetch(`/api/forum/posts?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        if (res.ok) {
            setNewPostTitle('');
            setNewPostContent('');
            setShowCreateForm(false);
            triggerToast("Opublikowano wpis!");
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
      const res = await fetch(`/api/forum/posts/${selectedPost.id}?userId=${userData.id}`, {
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
      const res = await fetch(`/api/forum/comments/${commentId}?userId=${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editValue.content })
      });

      if (res.ok) {
        setEditingComment(null);
        triggerToast("Zaktualizowano komentarz!");
        fetchPostDetails(selectedPost.id);
      }
    } catch (error) {
      triggerToast("Błąd podczas edycji komentarza.", true);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
        const res = await fetch(`/api/forum/posts/${selectedPost.id}/comments?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newComment })
        });

        if (res.ok) {
            setNewComment('');
            triggerToast("Dodano komentarz!");
            await fetchPostDetails(selectedPost.id);
        } else {
            triggerToast("Nie udało się dodać komentarza.", true);
        }
    } catch (error) {
        triggerToast("Błąd serwer.", true);
    }
  };

  const handleAddReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyValue.trim()) return;

    try {
        const res = await fetch(`/api/forum/posts/${selectedPost.id}/comments/${parentCommentId}/replies?authorId=${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: replyValue })
        });

        if (res.ok) {
            setReplyValue('');
            setReplyingTo(null);
            triggerToast("Dodano odpowiedź!");
            await fetchPostDetails(selectedPost.id);
        } else {
            triggerToast("Nie udało się dodać odpowiedzi.", true);
        }
    } catch (error) {
        triggerToast("Błąd serwera.", true);
    }
  };

  const handleSendReport = async (data) => {
    try {
      const res = await fetch(`/api/reports?reporterId=${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        triggerToast("Zgłoszenie zostało wysłane.");
      } else {
        triggerToast("Błąd podczas wysyłania zgłoszenia.", true);
      }
    } catch (error) {
      triggerToast("Błąd połączenia z serwerem.", true);
    }
  };

  const handleConfirmedDelete = async () => {
    try {
      if (modal.type === 'post') {
        const res = await fetch(`/api/forum/posts/${modal.id}?userId=${userData.id}&isAdmin=false`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setToast({ show: true, message: 'Post został usunięty', isError: false });
          if (selectedPost && selectedPost.id === modal.id) {
            setSelectedPost(null);
          }
          fetchPosts(currentPage);
        } else {
          setToast({ show: true, message: 'Błąd podczas usuwania wpisu', isError: true });
        }
      } else if (modal.type === 'comment') {
        const res = await fetch(`/api/forum/comments/${modal.id}?userId=${userData.id}&isAdmin=false`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setToast({ show: true, message: 'Komentarz usunięty', isError: false });
          if (selectedPost) fetchPostDetails(selectedPost.id);
        }
      }
    } catch (error) {
      setToast({ show: true, message: 'Błąd połączenia', isError: true });
    } finally {
      setModal({ show: false, type: null, id: null });
    }
  };

  const startEditingPost = () => {
    setEditValue({ title: selectedPost.title, content: selectedPost.content });
    setEditingPost(selectedPost.id);
  };

  const startEditingComment = (comment) => {
    setEditValue({ content: comment.content });
    setEditingComment(comment.id);
  };

  const renderComments = (comments, level = 0) => {
    return comments.map(comment => (
      <div key={comment.id} className={`${level > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-200 flex justify-between items-start text-left">
          <div className="flex-1">
            <p className="font-semibold text-sm text-indigo-600">
              {comment.author?.userLogin || 'Unknown'} • {new Date(comment.createdAt).toLocaleString()}
              {comment.edited && <span className="text-xs font-normal text-gray-400 ml-2 italic">(edytowany)</span>}
            </p>
            {editingComment === comment.id ? (
              <div className="mt-2 flex gap-2">
                <input 
                  className="text-black flex-1 border rounded px-2 py-1 text-sm outline-none"
                  maxLength={500}
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
                className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" /> Odpowiedz
              </button>
            )}

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleAddReply(e, comment.id)} className="mt-3 flex gap-2">
                <input 
                  className="text-black flex-1 border rounded-lg px-3 py-1 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Napisz odpowiedź..."
                  maxLength={500}
                  value={replyValue}
                  onChange={(e) => setReplyValue(e.target.value)}
                  autoFocus
                  required
                />
                <button type="submit" className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
          <div className="flex gap-2 ml-4 shrink-0">
            <button 
              onClick={() => setReportData({ show: true, targetType: 'COMMENT', targetId: comment.id })}
              className="text-gray-400 hover:text-orange-500"
              title="Zgłoś komentarz"
            >
              <Flag className="w-4 h-4" />
            </button>
            {comment.author?.id === userData.id && !editingComment && (
              <button onClick={() => startEditingComment(comment)} className="text-gray-400 hover:text-indigo-600">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {( comment.author?.id === userData.id) && (
              <button 
                  onClick={() => setModal({ show: true, type: 'comment', id: comment.id })}
                  className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Toast {...toast} />
      <ConfirmationModal 
            show={modal.show}
            message={`Czy na pewno chcesz usunąć ten ${modal.type === 'post' ? 'wpis' : 'komentarz'}?`}
            onConfirm={handleConfirmedDelete}
            onCancel={() => setModal({ show: false, type: null, id: null })}
        />
      <ReportModal 
        {...reportData}
        onClose={() => setReportData({ show: false, targetType: '', targetId: null })}
        onReport={handleSendReport}
      />
      <Header userLogin={userData.userLogin} currentPage="forum" />
      
      <main className="max-w-4xl mx-auto py-8 px-4 text-left">
        {selectedPost ? (
          <div className="space-y-6">
            <button onClick={() => { setSelectedPost(null); setEditingPost(null); setReplyingTo(null); }} className="flex items-center text-indigo-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" /> Powrót do listy
            </button>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-left">
              {editingPost === selectedPost.id ? (
                <form onSubmit={handleUpdatePost} className="space-y-3">
                  <input 
                    className="text-black w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={editValue.title}
                    maxLength={255}
                    onChange={(e) => setEditValue({...editValue, title: e.target.value})}
                    required
                  />
                  <textarea 
                    className="text-black w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={editValue.content}
                    maxLength={2000}
                    onChange={(e) => setEditValue({...editValue, content: e.target.value})}
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingPost(null)} className="p-2 text-gray-500"><X /></button>
                    <button type="submit" className="p-2 text-green-600"><Check /></button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {selectedPost.title}
                    </h1>
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button 
                        onClick={() => setReportData({ show: true, targetType: 'POST', targetId: selectedPost.id })}
                        className="text-gray-400 hover:text-orange-500 p-2"
                        title="Zgłoś wpis"
                      >
                        <Flag className="w-5 h-5" />
                      </button>
                      {selectedPost.author?.id === userData.id && (
                        <button onClick={startEditingPost} className="text-gray-400 hover:text-indigo-600 p-2">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {( selectedPost.author?.id === userData.id) && (
                        <button 
                          onClick={() => setModal({ show: true, type: 'post', id: selectedPost.id })} 
                          className="text-red-400 hover:text-red-600 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">
                    Przez {selectedPost.author?.userLogin} • {new Date(selectedPost.createdAt).toLocaleString()}
                    {selectedPost.edited && <span className="text-xs italic text-gray-400 ml-2">(edytowany)</span>}
                  </p>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-left">{selectedPost.content}</div>
                </>
              )}
            </div>

            <div className="space-y-4 text-left">
              <h3 className="text-xl text-indigo-600 font-bold flex items-center">
                <MessageSquare className="w-5 h-4 mr-2" /> Komentarze
              </h3>
              
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  className="text-black flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Napisz komentarz..."
                  maxLength={500}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
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
              <h1 className="text-2xl font-bold text-gray-900">Forum Społeczności</h1>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500 text-left">
                <h2 className="text-xl font-bold mb-4">Nowy wpis</h2>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input 
                    className="text-black w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Tytuł wpisu" 
                    maxLength={255}
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    required
                  />
                  <textarea 
                    className="text-black w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Treść wpisu..." 
                    maxLength={2000}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                  />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Anuluj</button>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">Opublikuj wpis</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer border border-gray-100 text-left"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>
                      Autor: {post.author?.userLogin || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}
                      {post.edited && <span className="italic ml-2">(edytowany)</span>}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" /> {post.comments?.length || 0}
                    </span>
                  </div>
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
      </main>
    </div>
  );
}