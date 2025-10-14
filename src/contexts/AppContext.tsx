import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, BlogPost, User, Bookmark, AnalyticsData } from '../types';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_BLOG_POST'; payload: BlogPost }
  | { type: 'UPDATE_BLOG_POST'; payload: BlogPost }
  | { type: 'DELETE_BLOG_POST'; payload: string }
  | { type: 'ADD_BOOKMARK'; payload: Bookmark }
  | { type: 'REMOVE_BOOKMARK'; payload: string }
  | { type: 'UPDATE_ANALYTICS'; payload: AnalyticsData }
  | { type: 'INCREMENT_VIEWS'; payload: string }
  | { type: 'INCREMENT_LIKES'; payload: string };

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

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
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'ADD_BLOG_POST':
      return { ...state, blogPosts: [...state.blogPosts, action.payload] };
    
    case 'UPDATE_BLOG_POST':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload.id ? action.payload : post
        )
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
    
    case 'INCREMENT_VIEWS':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload
            ? { ...post, views: post.views + 1 }
            : post
        )
      };
    
    case 'INCREMENT_LIKES':
      return {
        ...state,
        blogPosts: state.blogPosts.map(post =>
          post.id === action.payload
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      };
    
    default:
      return state;
  }
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('blogPosts');
    const savedBookmarks = localStorage.getItem('bookmarks');
    const savedUser = localStorage.getItem('user');

    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      posts.forEach((post: BlogPost) => {
        dispatch({ type: 'ADD_BLOG_POST', payload: post });
      });
    }

    if (savedBookmarks) {
      const bookmarks = JSON.parse(savedBookmarks);
      bookmarks.forEach((bookmark: Bookmark) => {
        dispatch({ type: 'ADD_BOOKMARK', payload: bookmark });
      });
    }

    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('blogPosts', JSON.stringify(state.blogPosts));
  }, [state.blogPosts]);

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
  }, [state.bookmarks]);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }, [state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
