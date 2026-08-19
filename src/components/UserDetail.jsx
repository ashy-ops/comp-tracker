import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Edit3, Check, Loader2, AlertCircle, ExternalLink, Code2 } from 'lucide-react';
import { fetchCodeforcesStats, fetchLeetCodeStats, fetchCodeChefStats } from '../utils/cpApi';

export default function UserDetail() {
  const { username } = useParams();
  const decodedName = decodeURIComponent(username || '');

  // Handles state for current profile
  const [handles, setHandles] = useState({
    codeforces: '',
    leetcode: '',
    codechef: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [inputHandles, setInputHandles] = useState({
    codeforces: '',
    leetcode: '',
    codechef: ''
  });

  // Fetched platform data
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [ccData, setCcData] = useState(null);

  // Loading & error states
  const [loading, setLoading] = useState({
    codeforces: false,
    leetcode: false,
    codechef: false
  });

  const [errors, setErrors] = useState({
    codeforces: '',
    leetcode: '',
    codechef: ''
  });

  // Load handles from cookie when profile changes
  useEffect(() => {
    try {
      const savedUsers = Cookies.get('cp_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        const currentUser = parsed.find(
          u => (typeof u === 'string' ? u : u.name).toLowerCase() === decodedName.toLowerCase()
        );

        if (currentUser && typeof currentUser === 'object' && currentUser.handles) {
          setHandles(currentUser.handles);
          setInputHandles(currentUser.handles);
        } else {
          setHandles({ codeforces: '', leetcode: '', codechef: '' });
          setInputHandles({ codeforces: '', leetcode: '', codechef: '' });
        }
      }
    } catch {
      // ignore
    }
  }, [decodedName]);

  // Fetch stats when handles state changes
  useEffect(() => {
    if (handles.codeforces) {
      loadCf(handles.codeforces);
    } else {
      setCfData(null);
    }

    if (handles.leetcode) {
      loadLc(handles.leetcode);
    } else {
      setLcData(null);
    }

    if (handles.codechef) {
      loadCc(handles.codechef);
    } else {
      setCcData(null);
    }
  }, [handles]);

  const loadCf = async (handle) => {
    setLoading(prev => ({ ...prev, codeforces: true }));
    setErrors(prev => ({ ...prev, codeforces: '' }));
    const data = await fetchCodeforcesStats(handle);
    if (data) {
      setCfData(data);
    } else {
      setCfData(null);
      setErrors(prev => ({ ...prev, codeforces: `Failed to fetch Codeforces stats for "${handle}"` }));
    }
    setLoading(prev => ({ ...prev, codeforces: false }));
  };

  const loadLc = async (handle) => {
    setLoading(prev => ({ ...prev, leetcode: true }));
    setErrors(prev => ({ ...prev, leetcode: '' }));
    const data = await fetchLeetCodeStats(handle);
    if (data) {
      setLcData(data);
    } else {
      setLcData(null);
      setErrors(prev => ({ ...prev, leetcode: `Failed to fetch LeetCode stats for "${handle}"` }));
    }
    setLoading(prev => ({ ...prev, leetcode: false }));
  };

  const loadCc = async (handle) => {
    setLoading(prev => ({ ...prev, codechef: true }));
    setErrors(prev => ({ ...prev, codechef: '' }));
    const data = await fetchCodeChefStats(handle);
    if (data) {
      setCcData(data);
    } else {
      setCcData(null);
      setErrors(prev => ({ ...prev, codechef: `Failed to fetch CodeChef stats for "${handle}"` }));
    }
    setLoading(prev => ({ ...prev, codechef: false }));
  };

  const handleSaveHandles = () => {
    const clean = {
      codeforces: inputHandles.codeforces.trim(),
      leetcode: inputHandles.leetcode.trim(),
      codechef: inputHandles.codechef.trim()
    };

    setHandles(clean);
    setIsEditing(false);

    // Save to cookies
    try {
      const savedUsers = Cookies.get('cp_users');
      let parsed = savedUsers ? JSON.parse(savedUsers) : [];

      parsed = parsed.map(item => {
        const itemName = typeof item === 'string' ? item : item.name;
        if (itemName.toLowerCase() === decodedName.toLowerCase()) {
          return { name: decodedName, handles: clean };
        }
        return typeof item === 'string' ? { name: item, handles: { codeforces: '', leetcode: '', codechef: '' } } : item;
      });

      // If user wasn't in array yet
      if (!parsed.some(u => u.name.toLowerCase() === decodedName.toLowerCase())) {
        parsed.push({ name: decodedName, handles: clean });
      }

      Cookies.set('cp_users', JSON.stringify(parsed), { expires: 7 });
      window.dispatchEvent(new Event('cp_users_updated'));
    } catch {
      // ignore
    }
  };

  const hasAnyHandle = Boolean(handles.codeforces || handles.leetcode || handles.codechef);

  return (
    <div className="flex-1 p-6 md:p-8 bg-gray-950 min-h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/10">
              {decodedName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{decodedName}</h1>
              <p className="text-xs text-gray-400 mt-0.5">CP Profile Dashboard</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition-colors w-fit"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            {isEditing ? 'Cancel Edit' : 'Manage Platform Handles'}
          </button>
        </div>

        {/* Edit Handles Form */}
        {isEditing && (
          <div className="bg-gray-900/90 border border-blue-500/40 rounded-2xl p-6 mb-8 backdrop-blur shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              Set Platform Handles for {decodedName}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Codeforces */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1.5">
                  Codeforces Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. tourist"
                  value={inputHandles.codeforces}
                  onChange={(e) => setInputHandles({ ...inputHandles, codeforces: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* LeetCode */}
              <div>
                <label className="block text-xs font-semibold text-orange-400 mb-1.5">
                  LeetCode Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. neetcode"
                  value={inputHandles.leetcode}
                  onChange={(e) => setInputHandles({ ...inputHandles, leetcode: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* CodeChef */}
              <div>
                <label className="block text-xs font-semibold text-yellow-500 mb-1.5">
                  CodeChef Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. chef_john"
                  value={inputHandles.codechef}
                  onChange={(e) => setInputHandles({ ...inputHandles, codechef: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHandles}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Handles
              </button>
            </div>
          </div>
        )}

        {/* Prompt if no handles configured */}
        {!hasAnyHandle && !isEditing && (
          <div className="bg-gray-900 border border-dashed border-gray-800 rounded-2xl p-8 text-center mb-8">
            <Code2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-200 mb-1">No Handles Added Yet</h3>
            <p className="text-xs text-gray-400 mb-4">
              Add handles for Codeforces, LeetCode, or CodeChef to display rating stats.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Add Handles Now
            </button>
          </div>
        )}

        {/* Minimal Platform Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. CODEFORCES CARD */}
          {handles.codeforces && (
            <div className="bg-gray-900 border border-amber-900/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider">Codeforces</h3>
                </div>
                <a
                  href={`https://codeforces.com/profile/${handles.codeforces}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-amber-400"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {loading.codeforces ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Fetching Codeforces stats...</p>
                </div>
              ) : errors.codeforces ? (
                <div className="py-4 text-center">
                  <AlertCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <p className="text-xs text-rose-300">{errors.codeforces}</p>
                </div>
              ) : cfData ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {cfData.titlePhoto ? (
                      <img
                        src={cfData.titlePhoto}
                        alt="Codeforces avatar"
                        className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-800/50 flex items-center justify-center font-bold text-amber-400 text-sm">
                        {handles.codeforces.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white leading-none">{cfData.handle || handles.codeforces}</p>
                      {cfData.rank && (
                        <p className="text-[11px] text-amber-400 capitalize mt-1 font-medium">{cfData.rank}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-gray-950/60 rounded-lg p-2.5 border border-gray-800/80 text-center">
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 font-medium">Rating</span>
                      <span className="text-base font-bold text-amber-400">{cfData.rating ?? 'Unrated'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 font-medium">Max Rating</span>
                      <span className="text-base font-bold text-gray-200">{cfData.maxRating ?? '-'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-500">No data returned</div>
              )}
            </div>
          )}

          {/* 2. LEETCODE CARD */}
          {handles.leetcode && (
            <div className="bg-gray-900 border border-orange-900/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                  <h3 className="text-xs font-bold uppercase text-orange-400 tracking-wider">LeetCode</h3>
                </div>
                <a
                  href={`https://leetcode.com/${handles.leetcode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-orange-400"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {loading.leetcode ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Fetching LeetCode stats...</p>
                </div>
              ) : errors.leetcode ? (
                <div className="py-4 text-center">
                  <AlertCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <p className="text-xs text-rose-300">{errors.leetcode}</p>
                </div>
              ) : lcData ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {lcData.avatar ? (
                      <img
                        src={lcData.avatar}
                        alt="LeetCode avatar"
                        className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-950/60 border border-orange-800/50 flex items-center justify-center font-bold text-orange-400 text-sm">
                        {handles.leetcode.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white leading-none">{lcData.user || handles.leetcode}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Rank: <span className="text-orange-400 font-medium">{lcData.rank ? `#${lcData.rank}` : 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-950/60 rounded-lg p-2.5 border border-gray-800/80">
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-gray-400 font-medium">Problems Solved</span>
                      <span className="font-bold text-orange-400">{lcData.problemsSolved ?? 0}</span>
                    </div>

                    {Array.isArray(lcData.submissions) && lcData.submissions.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] text-center">
                        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded py-1 text-emerald-400">
                          <span>Easy</span>
                          <span className="block font-bold">{lcData.submissions.find(s => s.difficulty === 'Easy')?.count ?? 0}</span>
                        </div>
                        <div className="bg-amber-950/40 border border-amber-800/40 rounded py-1 text-amber-400">
                          <span>Medium</span>
                          <span className="block font-bold">{lcData.submissions.find(s => s.difficulty === 'Medium')?.count ?? 0}</span>
                        </div>
                        <div className="bg-rose-950/40 border border-rose-800/40 rounded py-1 text-rose-400">
                          <span>Hard</span>
                          <span className="block font-bold">{lcData.submissions.find(s => s.difficulty === 'Hard')?.count ?? 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-500">No data returned</div>
              )}
            </div>
          )}

          {/* 3. CODECHEF CARD */}
          {handles.codechef && (
            <div className="bg-gray-900 border border-yellow-900/30 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <h3 className="text-xs font-bold uppercase text-yellow-500 tracking-wider">CodeChef</h3>
                </div>
                <a
                  href={`https://www.codechef.com/users/${handles.codechef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 hover:text-yellow-500"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {loading.codechef ? (
                <div className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Fetching CodeChef stats...</p>
                </div>
              ) : errors.codechef ? (
                <div className="py-4 text-center">
                  <AlertCircle className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                  <p className="text-xs text-rose-300">{errors.codechef}</p>
                </div>
              ) : ccData ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {ccData.avatar ? (
                      <img
                        src={ccData.avatar}
                        alt="CodeChef avatar"
                        className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-yellow-950/60 border border-yellow-800/50 flex items-center justify-center font-bold text-yellow-500 text-sm">
                        {handles.codechef.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white leading-none">{ccData.username || handles.codechef}</p>
                      {ccData.stars && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-bold bg-yellow-950 text-yellow-400 border border-yellow-700/50 rounded">
                          {ccData.stars}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-gray-950/60 rounded-lg p-2.5 border border-gray-800/80 text-center">
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 font-medium">Rating</span>
                      <span className="text-base font-bold text-yellow-500">{ccData.rating ?? 'Unrated'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-gray-400 font-medium">Global Rank</span>
                      <span className="text-base font-bold text-gray-200">{ccData.globalRank ? `#${ccData.globalRank}` : '-'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-gray-500">No data returned</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
