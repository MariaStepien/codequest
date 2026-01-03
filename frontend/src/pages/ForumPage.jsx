import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, ArrowLeft, Send, Plus, X } from 'lucide-react';
import Header from '../components/Header';

export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const jwtToken = localStorage.getItem('token');

  const [userData, setUserData] = useState({
      id: null,
      userLogin: "Gość",
      role: 'USER'
    });

  const isAdmin = userData.role === 'ADMIN' ? true : false;

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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    const postData = {
        title: newPostTitle,
        content: newPostContent
    };

    await fetch(`http://localhost:8080/api/forum/posts?authorId=${userData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
    });

    setNewPostTitle('');
    setNewPostContent('');
    setShowCreateForm(false);
    fetchPosts();
  };

  const handleDeletePost = async (id) => {
    await fetch(`http://localhost:8080/api/forum/posts/${id}?userId=${userData.id}&isAdmin=${isAdmin}`, { method: 'DELETE' });
    fetchPosts();
    setSelectedPost(null);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}/comments?authorId=${userData.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        const updatedPostRes = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` },
        });
        setSelectedPost(await updatedPostRes.json());
      } else if (response.status === 403) {
        console.error("Bląd 403");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userLogin={userData.userLogin} currentPage="forum" />
      
      <main className="max-w-4xl mx-auto py-8 px-4">
        {selectedPost ? (
          <div className="space-y-6">
            <button onClick={() => setSelectedPost(null)} className="flex items-center text-indigo-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" /> Powrót do listy
            </button>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900">{selectedPost.title}</h1>
                {(isAdmin || selectedPost.author?.id === userData.id) && (
                  <button onClick={() => handleDeletePost(selectedPost.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-4">Przez {selectedPost.author.userLogin} • {new Date(selectedPost.createdAt).toLocaleString()}</p>
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</div>
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
                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-indigo-200 flex justify-between">
                  <div>
                    <p className="font-semibold text-sm text-indigo-600">{comment.author?.userLogin || 'Unknown'}</p>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  {(isAdmin || comment.author?.id === userData.id) && (
                    <button onClick={async () => {
                        await fetch(`http://localhost:8080/api/forum/comments/${comment.id}?userId=${userData.id}&isAdmin=${isAdmin}`, { method: 'DELETE' });
                        const res = await fetch(`http://localhost:8080/api/forum/posts/${selectedPost.id}`);
                        setSelectedPost(await res.json());
                    }} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                title="Dodaj nowy post"
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
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Anuluj
                    </button>
                    <button 
                      type="submit" 
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      Opublikuj post
                    </button>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h3>
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