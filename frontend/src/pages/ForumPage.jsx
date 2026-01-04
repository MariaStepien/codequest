import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, ArrowLeft, Send, Plus, Edit2, Check, X } from 'lucide-react';
import Header from '../components/Header';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [editingPost, setEditingPost] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editValue, setEditValue] = useState({ title: '', content: '' });

  const [modal, setModal] = useState({show: false, type: null, id: null});
  const [toast, setToast] = useState({show: false, message: '', isError: false});

  const [userData, setUserData] = useState({
      id: null,
      userLogin: "Gość",
      role: 'USER'
    });

  const isAdmin = userData.role === 'ADMIN';

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
        setUserData(data);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania danych użytkownika:", error);
    }
  }

  const fetchPosts = async () => {
    const res = await fetch('http://localhost:8080/api/forum/posts');
    const data = await res.json();
    setPosts(data);
  };

  const fetchPostDetails = async (postId) => {
    try {
        const res = await fetch(`http://localhost:8080/api/forum/posts/${postId}`);
        if (res.ok) {
            const data = await res.json();
            setSelectedPost(data);
        }
    } catch (error) {
        console.error("Error refreshing post:", error);
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
            triggerToast("Opublikowano post!");
            fetchPosts();
        } else {
            triggerToast("Nie udało się opublikować posta.", true);
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
      triggerToast("Błąd podczas edycji posta.", true);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/forum/comments/${commentId}?userId=${userData.id}`, {
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
        const res = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}/comments?authorId=${userData.id}`, {
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

  const handleConfirmedDelete = async () => {
    const { type, id } = modal;
    const label = type === 'post' ? 'post' : 'komentarz';
    
    try {
        const res = await fetch(`http://localhost:8080/api/forum/${type}s/${id}?userId=${userData.id}&isAdmin=${isAdmin}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (res.ok) {
            triggerToast(`Pomyślnie usunięto ${label}.`);
            if (type === 'post') {
                setSelectedPost(null);
                fetchPosts();
            } else {
                await fetchPostDetails(selectedPost.id);
            }
        } else {
            triggerToast(`Nie udało się usunąć ${label}.`, true);
        }
    } catch (e) {
        triggerToast("Błąd połączenia z serwerem.", true);
    }
    setModal({ show: false, type: null, id: null });
  };

  const startEditingPost = () => {
    setEditValue({ title: selectedPost.title, content: selectedPost.content });
    setEditingPost(selectedPost.id);
  };

  const startEditingComment = (comment) => {
    setEditValue({ content: comment.content });
    setEditingComment(comment.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Toast {...toast} />
      <ConfirmationModal 
            show={modal.show}
            message={`Czy na pewno chcesz usunąć ten ${modal.type === 'post' ? 'post' : 'komentarz'}?`}
            onConfirm={handleConfirmedDelete}
            onCancel={() => setModal({ show: false, type: null, id: null })}
        />
      <Header userLogin={userData.userLogin} currentPage="forum" />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        {selectedPost ? (
          <div className="space-y-6">
            <button onClick={() => { setSelectedPost(null); setEditingPost(null); }} className="flex items-center text-indigo-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" /> Powrót do listy
            </button>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              {editingPost === selectedPost.id ? (
                <form onSubmit={handleUpdatePost} className="space-y-3">
                  <input 
                    className="text-black w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={editValue.title}
                    onChange={(e) => setEditValue({...editValue, title: e.target.value})}
                    required
                  />
                  <textarea 
                    className="text-black w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={editValue.content}
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
                  <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {selectedPost.title}
                      {selectedPost.edited && <span className="text-xs font-normal text-gray-400 ml-2">(edytowany)</span>}
                    </h1>
                    <div className="flex gap-2">
                      {selectedPost.author?.id === userData.id && (
                        <button onClick={startEditingPost} className="text-gray-400 hover:text-indigo-600 p-2">
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {(isAdmin || selectedPost.author?.id === userData.id) && (
                        <button 
                          onClick={() => setModal({ show: true, type: 'post', id: selectedPost.id })} 
                          className="text-red-400 hover:text-red-600 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">Przez {selectedPost.author?.userLogin} • {new Date(selectedPost.createdAt).toLocaleString()}</p>
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center">
                <MessageSquare className="w-5 h-4 mr-2" /> Komentarze
              </h3>
              
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  className="text-black flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Napisz komentarz..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700">
                  <Send className="w-5 h-5" />
                </button>
              </form>

              {selectedPost.comments.map(comment => (
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-200 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-indigo-600">
                      {comment.author?.userLogin || 'Unknown'}
                      {comment.edited && <span className="text-xs font-normal text-gray-400 ml-2">(edytowany)</span>}
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
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {comment.author?.id === userData.id && !editingComment && (
                      <button onClick={() => startEditingComment(comment)} className="text-gray-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {(isAdmin || comment.author?.id === userData.id) && (
                      <button 
                          onClick={() => setModal({ show: true, type: 'comment', id: comment.id })}
                          className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
                <h2 className="text-xl font-bold mb-4">Nowy wpis</h2>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input 
                    className="text-black w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Tytuł posta" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    required
                  />
                  <textarea 
                    className="text-black w-full border rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="Treść posta..." 
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
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer border border-gray-100"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {post.title}
                    {post.edited && <span className="text-xs font-normal text-gray-400 ml-2">(edytowany)</span>}
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Autor: {post.author?.userLogin || 'Unknown'}</span>
                    <span className="flex items-center">
                      <MessageSquare className="w-3 h-3 mr-1" /> {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}