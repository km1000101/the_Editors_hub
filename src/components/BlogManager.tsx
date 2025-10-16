import React, { useState, useEffect, useRef } from 'react'; // ADDED useEffect and useRef
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import type { BlogPost, Comment } from '../types';
import toast from "react-hot-toast"; 
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  HeartIcon as HeartOutlineIcon, // Renamed for clarity
  ChatBubbleLeftIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'; // Import Solid Heart
import ReactQuill from 'react-quill'; 
import 'react-quill/dist/quill.snow.css'; 

// Define constants for Auto-Save
const DRAFT_KEY = 'blogDrafts';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

const BlogManager: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const autosaveTimerRef = useRef<number | null>(null); // To manage the timer

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: ''
  });

  // --- AUTOSAVE LOGIC ---

  // Effect 1: Load draft on component mount
  useEffect(() => {
    // Only attempt to load a draft if we are in 'create' mode (not editing)
    if (!editingPost) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            setFormData(draft);
            setShowCreateForm(true); 
            toast("Draft restored!", {icon: "💾"});
        } catch (e) {
            console.error("Failed to parse saved draft:", e);
        }
      }
    }
    // Cleanup function for the timer reference
    return () => {
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }
    };
  }, [editingPost]); // Re-run if we switch from editing to creating

  // Effect 2: Setup interval to save draft whenever form data changes
  useEffect(() => {
    if (showCreateForm) {
      // Clear previous timer to debounce the save operation
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = window.setTimeout(() => {
        // Only save if the form has some content
        if (formData.title.trim() || formData.content.trim()) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
            console.log("Draft saved automatically.");
        }
      }, AUTOSAVE_INTERVAL);
    }
    
    // Cleanup the timeout when the form state changes or the component unmounts
    return () => {
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }
    };
  }, [formData, showCreateForm]);
  // --- END AUTOSAVE LOGIC ---


  // --- LIKE TOGGLE HANDLER ---

  const handleLikeToggle = (postId: string, currentLikes: string[] | undefined) => {
    const userId = state.user?.id;
    if (!userId) {
      toast.error("Please sign in to like a post.", { icon: "🔒" });
      return;
    }

    const hasLiked = currentLikes?.includes(userId);
    const successMsg = hasLiked ? "Post unliked." : "Post liked!";
    
    // Dispatch the single TOGGLE_LIKE action
    dispatch({ type: 'TOGGLE_LIKE', payload: { postId, userId } });
    toast.success(successMsg, { icon: hasLiked ? "🤍" : "❤️" });
  };


  // --- CRUD HANDLERS (UPDATED TO CLEAR DRAFT) ---

  const handleCreatePost = () => {
    if (!formData.title || !formData.content) return;

    // Clear draft storage on successful creation
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
    }
    if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
    }

    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
      author: state.user?.username || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      userLikes: [] // Initialize new userLikes array
    };

    dispatch({ type: 'ADD_BLOG_POST', payload: newPost });
    toast.success(`Created new blog: "${formData.title}"`, { icon: "📝" });
    setFormData({ title: '', content: '', excerpt: '', tags: '' });
    setShowCreateForm(false);
  };

  const handleUpdatePost = () => {
    if (!editingPost || !formData.title || !formData.content) return;

    // Clear draft storage on successful update
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
    }
    if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
    }

    const updatedPost: BlogPost = {
      ...editingPost,
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
      updatedAt: new Date().toISOString(),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    dispatch({ type: 'UPDATE_BLOG_POST', payload: updatedPost });
    toast.success(`Edited the blog: "${formData.title}"`, { icon: "✏️" });
    setEditingPost(null);
    setFormData({ title: '', content: '', excerpt: '', tags: '' });
    setShowCreateForm(false); 
  };

  const handleDeletePost = (postId: string, title: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch({ type: "DELETE_BLOG_POST", payload: postId });
      toast.error(`Deleted blog: "${title}"`, {
        icon: "🗑️",
        duration: 3000,
      });
      if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(null);
      }
    }
  };


  const handleView = (post: BlogPost) => {
    dispatch({ type: 'INCREMENT_VIEWS', payload: post.id });
    setSelectedPost(post);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: state.user?.username || 'Anonymous',
      content: commentText,
      createdAt: new Date().toISOString()
    };

    dispatch({
      type: 'ADD_COMMENT',
      payload: { postId, comment: newComment }
    });

    setCommentText('');
    toast.success("Comment posted!", { icon: "💬" });

    if (selectedPost) {
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, newComment]
      });
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', excerpt: '', tags: '' });
    setShowCreateForm(false);
    setEditingPost(null);
    // CLEAR DRAFT on manual reset
    if (typeof localStorage !== 'undefined') { // Safety check
      localStorage.removeItem(DRAFT_KEY);
    }
    if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      tags: post.tags.join(', ')
    });
    setShowCreateForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Create and manage your blog posts
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Post
        </button>
      </motion.div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Enter post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="input-field"
                placeholder="Brief description of your post..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <ReactQuill 
                value={formData.content} 
                onChange={(content) => setFormData({ ...formData, content })} 
                className="bg-white dark:bg-gray-700 rounded-md text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="technology, programming, web development..."
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 italic">
                    Draft is automatically saved every {AUTOSAVE_INTERVAL / 1000} seconds.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingPost ? handleUpdatePost : handleCreatePost}
                      className="btn-primary"
                    >
                      {editingPost ? 'Update Post' : 'Create Post'}
                    </button>
                </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blog Posts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {state.blogPosts.map((post, index) => {
          // Check if current user has liked this post
          const userId = state.user?.id;
          // FIX: Added check to ensure userId exists before calling includes()
          const hasLiked = userId && post.userLikes?.includes(userId);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {post.author}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(post.createdAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {post.views}
                    </div>
                    {/* Likes Display (Color changes based on current user like status) */}
                    <div className={`flex items-center ${hasLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {hasLiked ? <HeartSolidIcon className="w-4 h-4 mr-1 fill-current" /> : <HeartOutlineIcon className="w-4 h-4 mr-1" />}
                      {post.likes}
                    </div>
                    <div className="flex items-center">
                      <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                      {post.comments.length}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => handleView(post)}
                    className="btn-secondary text-sm"
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(post)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    {/* Like/Unlike Toggle Button */}
                    <button
                      onClick={() => handleLikeToggle(post.id, post.userLikes)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {/* Icon is conditional based on hasLiked status */}
                      {hasLiked ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-500" />
                      ) : (
                        <HeartOutlineIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {state.blogPosts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <PencilIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            No blog posts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Start writing your first blog post to share your thoughts with the world.
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="btn-primary"
          >
            Create Your First Post
          </button>
        </motion.div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedPost.title}
                </h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {selectedPost.content}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>By {selectedPost.author}</span>
                    <span>•</span>
                    <span>{formatDate(selectedPost.createdAt)}</span>
                    <span>•</span>
                    <span>{selectedPost.views} views</span>
                    <span>•</span>
                    <span>{selectedPost.likes} likes</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Comments ({selectedPost.comments.length})
                </h3>

                <div className="space-y-4 mb-6">
                  {selectedPost.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleAddComment(selectedPost.id)}
                    className="btn-primary"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default BlogManager;
