# Editor's Hub

A modern front-end web application that combines the power of a personal blogging platform with a real-time news aggregator and an analytics dashboard.

## 🚀 Features

### 📰 News Aggregator
- Fetch and display trending articles from public APIs
- Search functionality with real-time filtering
- Category filters (Technology, Business, Health, Sports, etc.)
- Bookmark articles for later reading
- Responsive card-based layout with smooth animations

### ✍️ Personal Blog System
- Create, edit, and delete blog posts
- Rich text editor for content creation
- Tag system for post organization
- Comment system for each post
- Auto-save drafts functionality
- Post analytics (views, likes, comments)

### 📊 Analytics Dashboard
- Interactive charts using Recharts
- Track post views, likes, and comments over time
- Top performing posts leaderboard
- Engagement metrics and insights
- Real-time data visualization

### 🎨 User Experience
- Dark/Light mode toggle
- Responsive design for all devices
- Smooth animations with Framer Motion
- Modern UI with Tailwind CSS
- Intuitive navigation and user flow

## 🛠️ Tech Stack

- **Frontend Framework:** React.js with TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **Animation:** Framer Motion
- **Charts:** Recharts
- **State Management:** React Context API
- **Routing:** React Router DOM
- **Icons:** Heroicons
- **Storage:** Local Storage
- **Build Tool:** Vite

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd the-editors-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📱 Usage

### News Section
- Browse trending articles by category
- Use the search bar to find specific topics
- Bookmark interesting articles
- Click "Read More" to view full articles

### Blog Management
- Click "New Post" to create a blog post
- Use the rich text editor to write content
- Add tags to categorize your posts
- Edit or delete existing posts
- View post analytics and engagement

### Analytics Dashboard
- Monitor your content performance
- View interactive charts and graphs
- Track engagement metrics over time
- Identify your top-performing content

### User Authentication
- Sign up or log in (demo mode)
- Access personalized features
- Manage your bookmarks and posts

## 🎯 Key Features Implemented

✅ **News Aggregator**
- Live news fetching (mock data)
- Search and filter functionality
- Bookmark system
- Responsive card layout

✅ **Blog Management**
- CRUD operations for posts
- Rich text editing
- Tag system
- Comment system
- Auto-save functionality

✅ **Analytics Dashboard**
- Interactive charts (Line, Bar, Area, Pie)
- Real-time metrics
- Top posts leaderboard
- Engagement overview

✅ **User Experience**
- Dark/Light theme toggle
- Responsive design
- Smooth animations
- Modern UI components

✅ **Data Persistence**
- Local storage integration
- State management with Context API
- Data persistence across sessions

## 🔧 Customization

### Adding New Features
- Extend the `AppContext` for new state management
- Create new components in the `components` directory
- Add new pages in the `pages` directory
- Update routing in `App.tsx`

### Styling
- Modify Tailwind classes in components
- Add custom CSS in `src/style.css`
- Update theme colors in `tailwind.config.js`

### Data Sources
- Replace mock data with real API calls
- Update the news aggregator to use actual news APIs
- Integrate with a backend service for blog posts

## 📄 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AnalyticsDashboard.tsx
│   ├── BlogManager.tsx
│   ├── Navbar.tsx
│   └── NewsAggregator.tsx
├── contexts/           # React Context providers
│   ├── AppContext.tsx
│   └── ThemeContext.tsx
├── pages/              # Page components
│   ├── Bookmarks.tsx
│   ├── Home.tsx
│   └── Login.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.tsx             # Main App component
├── main.ts             # Application entry point
└── style.css           # Global styles
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Framer Motion for smooth animations
- Recharts for beautiful charts
- Heroicons for the icon set

---

**Note:** This is a frontend-only demo application. In a production environment, you would need to integrate with real APIs and backend services for data persistence and user authentication.
