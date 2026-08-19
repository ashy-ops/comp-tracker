import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { UserPlus, Trash2, User, Trophy } from 'lucide-react';

export default function Sidebar() {
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const loadUsersFromCookie = () => {
    try {
      const savedUsers = Cookies.get('cp_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        // Normalize user entries
        const formatted = parsed.map(item => {
          if (typeof item === 'string') {
            return { name: item, handles: { codeforces: '', leetcode: '', codechef: '' } };
          }
          return {
            name: item.name || item.username || 'User',
            handles: item.handles || {
              codeforces: item.platforms?.codeforces ? item.name || '' : '',
              leetcode: item.platforms?.leetcode ? item.name || '' : '',
              codechef: item.platforms?.codechef ? item.name || '' : ''
            }
          };
        });
        setUsers(formatted);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    }
  };

  // Load users from cookies on initial render and on custom cp_users_updated event
  useEffect(() => {
    loadUsersFromCookie();

    const handleUsersUpdate = () => {
      loadUsersFromCookie();
    };

    window.addEventListener('cp_users_updated', handleUsersUpdate);
    return () => {
      window.removeEventListener('cp_users_updated', handleUsersUpdate);
    };
  }, []);

  const handleAddUser = () => {
    const newName = inputValue.trim();
    if (!newName) return;

    // Prevent duplicate holding names (case insensitive)
    const exists = users.some(u => u.name.toLowerCase() === newName.toLowerCase());
    if (exists) {
      setErrorMsg(`"${newName}" is already in your users list.`);
      return;
    }

    const newUserObject = {
      name: newName,
      handles: {
        codeforces: '',
        leetcode: '',
        codechef: ''
      }
    };

    const updatedUsers = [...users, newUserObject];
    setUsers(updatedUsers);
    Cookies.set('cp_users', JSON.stringify(updatedUsers), { expires: 7 });
    window.dispatchEvent(new Event('cp_users_updated'));

    setInputValue('');
    setErrorMsg('');
    navigate(`/user/${encodeURIComponent(newName)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddUser();
    }
  };

  const handleDeleteUser = (e, nameToDelete) => {
    e.stopPropagation();
    e.preventDefault();

    const updatedUsers = users.filter(u => u.name.toLowerCase() !== nameToDelete.toLowerCase());
    setUsers(updatedUsers);
    Cookies.set('cp_users', JSON.stringify(updatedUsers), { expires: 7 });
    window.dispatchEvent(new Event('cp_users_updated'));

    // Redirect to home if current user detail page was deleted
    if (location.pathname === `/user/${encodeURIComponent(nameToDelete)}`) {
      navigate('/');
    }
  };

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 text-gray-100 min-h-screen p-5 flex flex-col justify-between select-none">
      <div>
        {/* App Title */}
        <Link to="/" className="flex items-center gap-2.5 mb-6 group">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CP Tracker
            </h1>
            <p className="text-xs text-gray-400">Competitive Programming</p>
          </div>
        </Link>

        {/* Input Holding Name */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
            Add Profile Name
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="e.g. Ashy, John..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={handleKeyDown}
              className="w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddUser}
              disabled={!inputValue.trim()}
              title="Add User Profile"
              className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <p className="mt-2 text-xs text-rose-400">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Users List */}
        <div>
          <h2 className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-3">
            Users ({users.length})
          </h2>

          {users.length === 0 ? (
            <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-800 text-center">
              <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No profiles created yet.</p>
              <p className="text-[11px] text-gray-500 mt-1">Add a name above to get started.</p>
            </div>
          ) : (
            <ul className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {users.map((u, idx) => {
                const isActive = location.pathname === `/user/${encodeURIComponent(u.name)}`;
                const hasCf = Boolean(u.handles?.codeforces);
                const hasLc = Boolean(u.handles?.leetcode);
                const hasCc = Boolean(u.handles?.codechef);

                return (
                  <li key={`${u.name}-${idx}`}>
                    <Link
                      to={`/user/${encodeURIComponent(u.name)}`}
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${isActive
                          ? 'bg-blue-600/15 border-blue-500/50 text-blue-300 font-medium'
                          : 'bg-gray-800/60 border-gray-800/80 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
                        }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-blue-400 transition-colors" />
                          <span className="truncate text-sm font-medium">{u.name}</span>
                        </div>

                        {/* Platform indicators */}
                        <div className="flex items-center gap-1 mt-1 pl-6">
                          {hasCf && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/50 rounded">
                              CF
                            </span>
                          )}
                          {hasLc && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-orange-950/80 text-orange-400 border border-orange-800/50 rounded">
                              LC
                            </span>
                          )}
                          {hasCc && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-900/60 text-amber-300 border border-amber-700/50 rounded">
                              CC
                            </span>
                          )}
                          {!hasCf && !hasLc && !hasCc && (
                            <span className="text-[10px] text-gray-500 italic">No handles set</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteUser(e, u.name)}
                        title="Delete Profile"
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-all shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-800 text-[11px] text-gray-500">
        <span>Stored in `cp_users` cookie</span>
      </div>
    </aside>
  );
}