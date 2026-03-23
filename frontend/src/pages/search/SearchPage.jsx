import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useFollow from '../../hooks/useFollow';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { follow, isFollowing } = useFollow();

  let debounceTimer;
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setDebouncedQuery(value.trim());
    }, 400);
  };

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { users: [] };
      const res = await fetch(
        `/api/v1/users/search?q=${encodeURIComponent(debouncedQuery)}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      return data;
    },
    enabled: debouncedQuery.length > 0,
  });

  const users = searchResults?.users || [];

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      <div className="p-4 border-b border-gray-700">
        <h1 className="font-bold text-lg mb-4">Search Users</h1>
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username or name..."
            className="input input-bordered w-full pl-10 rounded-full"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && debouncedQuery && users.length === 0 && (
        <div className="text-center p-8 text-slate-500">
          No users found for "{debouncedQuery}"
        </div>
      )}

      {!isLoading && !debouncedQuery && (
        <div className="text-center p-8 text-slate-500">
          Start typing to search for users
        </div>
      )}

      {users.map((user) => {
        const isMe = authUser?.data?._id === user._id;
        const amIFollowing = authUser?.data?.following?.includes(user._id);

        return (
          <div
            key={user._id}
            className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-[#16181C] transition"
          >
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-3 flex-1"
            >
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img
                    src={user.profilePicture || '/avatar-placeholder.png'}
                    alt={user.username}
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">{user.fullName}</span>
                <span className="text-sm text-slate-500">
                  @{user.username}
                </span>
                {user.bio && (
                  <span className="text-sm text-slate-400 truncate max-w-[200px]">
                    {user.bio}
                  </span>
                )}
              </div>
            </Link>
            {!isMe && (
              <button
                className="btn btn-outline rounded-full btn-sm"
                onClick={() => follow(user._id)}
                disabled={isFollowing}
              >
                {amIFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SearchPage;
