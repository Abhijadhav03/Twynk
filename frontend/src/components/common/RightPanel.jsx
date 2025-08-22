import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import RightPanelSkeleton from '../skeletons/rightPanelSkeleton';
import LoadingSpinner from './LoadingSpinner';
import useFollow from '../../hooks/useFollow';

const RightPanel = () => {
  const { follow, isFollowing } = useFollow();

  const {
    data: suggest,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/v1/users/suggested', {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      return data; // Expecting { users: [...] }
    },
  });

  // Loading state
  if (isLoading) {
    return <RightPanelSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <div className="hidden lg:block my-4 mx-2">
        <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
          <p className="font-bold">Who to follow</p>
          <p className="text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block my-4 mx-2 md:w-1/3">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {suggest?.users?.length > 0 ? (
            suggest.users.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={user.profilePicture || '/avatar-placeholder.png'}
                        alt={user.fullName || 'User avatar'}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullName}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <button
                  className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    follow(user._id);
                  }}
                  disabled={isFollowing} // Disable while loading
                >
                  {isFollowing ? <LoadingSpinner /> : 'Follow'}
                </button>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500">No suggested users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
