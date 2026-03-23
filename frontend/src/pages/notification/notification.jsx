import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { IoSettingsOutline } from 'react-icons/io5';
import { FaUser, FaComment } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa6';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatNotificationDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/v1/notifications/', {
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      return data;
    },
  });

  // Mark all as read when page loads
  const { mutate: markAsRead } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/notifications/mark-read', {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Mark as read when notifications load
  const { data: unread } = useQuery({
    queryKey: ['markReadTrigger'],
    queryFn: async () => {
      await markAsRead();
      return true;
    },
    enabled: notifications.length > 0,
  });

  const { mutate: deleteAll, isPending: isDeletingAll } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v1/notifications/', {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      return data;
    },
    onSuccess: () => {
      toast.success('All notifications deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: deleteSingle } = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch(`/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  const handleDeleteAll = () => {
    deleteAll();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <FaUser className="w-7 h-7 text-primary" />;
      case 'like':
        return <FaHeart className="w-7 h-7 text-red-500" />;
      case 'comment':
        return <FaComment className="w-7 h-7 text-blue-400" />;
      default:
        return <FaUser className="w-7 h-7 text-primary" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'follow':
        return 'followed you';
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      default:
        return 'interacted with you';
    }
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold text-lg">Notifications</p>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={handleDeleteAll}>
                  {isDeletingAll ? 'Deleting...' : 'Delete all notifications'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {isLoadingNotifications && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoadingNotifications && notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}

        {!isLoadingNotifications &&
          notifications?.map((notification) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4 items-start">
                {getNotificationIcon(notification.type)}
                <Link
                  to={`/profile/${notification.from?.username}`}
                  className="flex gap-2 items-center flex-1"
                >
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from?.profilePicture ||
                          '/avatar-placeholder.png'
                        }
                        alt={notification.from?.username}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex gap-1 items-center">
                      <span className="font-bold">
                        @{notification.from?.username}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {getNotificationText(notification)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600">
                      {formatNotificationDate(notification.createdAt)}
                    </span>
                  </div>
                </Link>
                <button
                  className="btn btn-ghost btn-xs text-slate-500 hover:text-red-500"
                  onClick={() => deleteSingle(notification._id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default NotificationPage;
