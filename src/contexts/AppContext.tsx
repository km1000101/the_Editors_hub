import React, { createContext, useContext, useReducer, useEffect } from 'react';
// Added Comment to imports, ensuring all types are available
import type { AppState, BlogPost, User, Bookmark, AnalyticsData, NewsArticle, Comment } from '../types'; 

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'ADD_BLOG_POST'; payload: BlogPost }
  | { type: 'UPDATE_BLOG_POST'; payload: BlogPost }
  | { type: 'DELETE_BLOG_POST'; payload: string }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_ANALYTICS'; payload: AnalyticsData }
  | { type: 'SET_NEWS_ARTICLES'; payload: NewsArticle[] }
  | { type: 'UPDATE_NEWS_ANALYTICS'; payload: AnalyticsData }
  | { type: 'INCREMENT_VIEWS'; payload: string }
  | { type: 'TOGGLE_LIKE'; payload: { postId: string; userId: string } }
  | { type: 'TOGGLE_BLOG_BOOKMARK'; payload: { postId: string; userId: string } }
  | { type: 'ADD_COMMENT'; payload: { postId: string; comment: Comment } }; 

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Re-add the initialState constant here
const initialState: AppState = {
  theme: 'light',
  user: null,
  blogPosts: [],
  bookmarks: [],
  analytics: {
    postViews: [],
    postLikes: [],
    comments: [],
    topPosts: []
  },
  newsArticles: [],
  newsAnalytics: {
    postViews: [],
    postLikes: [],
    comments: [],
    topPosts: []
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      localStorage.removeItem('user');
      return { ...state, user: null };

    case 'ADD_BLOG_POST':
      return { ...state, blogPosts: [...state.blogPosts, action.payload] };

    case 'UPDATE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        ),
      };

    case 'DELETE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.filter(post => post.id !== action.payload)
      };

    case 'ADD_BOOKMARK':
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };

    case 'REMOVE_BOOKMARK':
      return {
        ...state,
        bookmarks: state.bookmarks.filter(bookmark => bookmark.id !== action.payload)
      };

    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: action.payload };

    case 'SET_NEWS_ARTICLES':
      return { ...state, newsArticles: action.payload };

    case 'UPDATE_NEWS_ANALYTICS':
      return { ...state, newsAnalytics: action.payload };

    case 'INCREMENT_VIEWS':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload
            ? { ...post, views: post.views + 1 }
            : post
        )
      };
      
    // NEW: TOGGLE_LIKE REDUCER LOGIC
    case 'TOGGLE_LIKE':
      const { postId, userId } = action.payload;
      return {
        ...state,
        blogPosts: state.blogPosts.map(post => {
          if (post.id !== postId) return post;

          const hasLiked = post.userLikes?.includes(userId);
          let newUserLikes;
          let newLikesCount;

          if (hasLiked) {
            // UNLIKE: Remove user ID from array and decrement likes
            newUserLikes = post.userLikes.filter(id => id !== userId);
            newLikesCount = post.likes - 1;
          } else {
            // LIKE: Add user ID to array and increment likes
            newUserLikes = [...(post.userLikes || []), userId];
            newLikesCount = post.likes + 1;
          }

          return {
            ...post,
            likes: newLikesCount,
            userLikes: newUserLikes // Stored array of user IDs
          };
        }),
      };

    case 'ADD_COMMENT':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload.postId
            ? { ...post, comments: [...post.comments, action.payload.comment] }
            : post
        )
      };

    case 'TOGGLE_BLOG_BOOKMARK':
      const { postId: bookmarkPostId, userId: bookmarkUserId } = action.payload;
      return {
        ...state,
        blogPosts: state.blogPosts.map(post => {
          if (post.id !== bookmarkPostId) return post;

          const hasBookmarked = post.userBookmarks?.includes(bookmarkUserId);
          let newUserBookmarks;

          if (hasBookmarked) {
            newUserBookmarks = post.userBookmarks.filter(id => id !== bookmarkUserId);
          } else {
            newUserBookmarks = [...(post.userBookmarks || []), bookmarkUserId];
          }

          return {
            ...post,
            userBookmarks: newUserBookmarks
          };
        }),
      };

    default:
      return state;
  }
};

const initializer = (initialState: AppState) => {
  const savedUser = localStorage.getItem('user');
  const savedPosts = localStorage.getItem('blogPosts');
  const savedBookmarks = localStorage.getItem('bookmarks');

  return {
    ...initialState,
    user: savedUser ? JSON.parse(savedUser) : initialState.user,
    blogPosts: savedPosts ? JSON.parse(savedPosts) : initialState.blogPosts,
    bookmarks: savedBookmarks ? JSON.parse(savedBookmarks) : initialState.bookmarks,
  };
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, initializer);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(state.user));
    localStorage.setItem('blogPosts', JSON.stringify(state.blogPosts));
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  }, [state.user, state.blogPosts, state.bookmarks]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
