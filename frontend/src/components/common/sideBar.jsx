import XSvg from '../svgs/x';
import toast from 'react-hot-toast';
import { MdHomeFilled } from 'react-icons/md';
import { IoNotifications } from 'react-icons/io5';
import { FaUser, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { BiLogOut } from 'react-icons/bi';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';

const Sidebar = () => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authUser'] });
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: authUser } = useQuery({
    queryKey: ['authUser'],
  });

  // Fetch unread notification count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const res = await fetch('/api/v1/notifications/unread-count', {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) return { count: 0 };
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <Link to="/" className="flex justify-center md:justify-start">
          <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
        </Link>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/search"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaSearch className="w-6 h-6" />
              <span className="text-lg hidden md:block">Search</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer relative"
            >
              <div className="relative">
                <IoNotifications className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${authUser?.data?.username}`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>
        </ul>
        {authUser && (
          <Link
            to={`/profile/${authUser.data?.username}`}
            className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
          >
            <div className="avatar hidden md:inline-flex">
              <div className="w-8 rounded-full">
                <img
                  src={
                    authUser?.data?.profilePicture ||
                    '/avatar-placeholder.png'
                  }
                  alt={authUser?.data?.username}
                />
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {authUser?.data?.fullName}
                </p>
                <p className="text-slate-500 text-sm">
                  @{authUser?.data?.username}
                </p>
              </div>
              <BiLogOut
                className="w-5 h-5 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  mutate();
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
