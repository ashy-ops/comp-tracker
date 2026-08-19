import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './sidebar';
import UserDetail from './components/UserDetail';
import { Globe, Code2 } from 'lucide-react';

function HomeView() {
  return (
    <div className="flex-1 p-8 bg-gray-950 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">CP Tracker</h1>
          <p className="text-gray-400">
            Create user profiles and track stats across Codeforces, LeetCode, and CodeChef.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg w-fit mb-4">
              <Code2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">3 Major Platforms</h2>
            <p className="text-sm text-gray-400">
              Configure handles for Codeforces, LeetCode, and CodeChef to display live rating and problem stats.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-lg w-fit mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Cookie Persistence</h2>
            <p className="text-sm text-gray-400">
              Your profile holding names and configured handles are automatically stored in browser cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

//react-router-dom changes what is shown in the Main Content Area depending on the URL path (/ shows HomeView, while /user/Ashy shows UserDetail).
export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-950 font-sans">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/user/:username" element={<UserDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
