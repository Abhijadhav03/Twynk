import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import Posts from '../../components/common/posts';
import ProfileHeaderSkeleton from '../../components/skeletons/ProfileHeaderSkeleton';
import EditProfileModal from './EditProfileModal';

import { FaArrowLeft, FaLink } from 'react-icons/fa';
import { IoCalendarOutline } from 'react-icons/io5';
import { MdEdit } from 'react-icons/md';
import { formatJoinDate } from '../../utils/formatDate';
import useFollow from '../../hooks/useFollow';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();

  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState('posts');

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { follow, isFollowing } = useFollow();

  // Fetch the profile user
  const fetchUser = async () => {
    const res = await fetch(`/api/v1/users/profile/${username}`, {
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
    return data;
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profileUser', username],
    queryFn: fetchUser,
    enabled: !!username,
  });

  // Get auth user from cache
  const { data: authUser } = useQuery({ queryKey: ['authUser'] });

  const user = data?.user;
  const isMyProfile = authUser?.data?._id === user?._id;
  const amIFollowing = authUser?.data?.following?.includes(user?._id);

  // Reset images when navigating to different profile
  useEffect(() => {
    setCoverImg(null);
    setProfileImg(null);
    setFeedType('posts');
    refetch();
  }, [username, refetch]);

  // Mutation to update profile/cover images
  const { mutate: updateImages, isPending: isUpdatingImages } = useMutation({
    mutationFn: async ({ profileImg, coverImg }) => {
      const res = await fetch('/api/v1/users/update', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImg, coverImg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update images');
      return data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      setCoverImg(null);
      setProfileImg(null);
      queryClient.invalidateQueries({ queryKey: ['profileUser'] });
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (state === 'coverImg') setCoverImg(reader.result);
        if (state === 'profileImg') setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImages = () => {
    updateImages({ profileImg, coverImg });
  };

  const handleFollowUnfollow = () => {
    if (user?._id) {
      follow(user._id);
    }
  };

  if (isLoading) return <ProfileHeaderSkeleton />;
  if (isError)
    return (
      <p className="text-center text-lg mt-4 text-red-500">
        Error: {error.message}
      </p>
    );
  if (!user) return <p className="text-center text-lg mt-4">User not found</p>;

  return (
    <div
      className="flex-[4_4_0] border-r border-gray-700 min-h-screen"
      data-theme="forest"
    >
      <div className="flex flex-col">
        <div className="flex gap-10 px-4 py-2 items-center">
          <Link to="/">
            <FaArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex flex-col">
            <p className="font-bold text-lg">{user.fullName}</p>
          </div>
        </div>

        <div className="relative group/cover">
          <img
            src={coverImg || user.coverPicture || '/cover.png'}
            className="h-52 w-full object-cover"
            alt="cover"
          />
          {isMyProfile && (
            <div
              className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
              onClick={() => coverImgRef.current.click()}
            >
              <MdEdit className="w-5 h-5 text-white" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={coverImgRef}
            onChange={(e) => handleImgChange(e, 'coverImg')}
          />
          <input
            type="file"
            accept="image/*"
            hidden
            ref={profileImgRef}
            onChange={(e) => handleImgChange(e, 'profileImg')}
          />

          <div className="avatar absolute -bottom-16 left-4">
            <div className="w-32 rounded-full relative group/avatar">
              <img
                src={
                  profileImg || user.profilePicture || '/avatar-placeholder.png'
                }
                alt="avatar"
                className="rounded-full"
              />
              {isMyProfile && (
                <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                  <MdEdit
                    className="w-4 h-4 text-white"
                    onClick={() => profileImgRef.current.click()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end px-4 mt-5">
          {isMyProfile && <EditProfileModal authUser={authUser?.data} />}
          {!isMyProfile && (
            <button
              className="btn btn-outline rounded-full btn-sm"
              onClick={handleFollowUnfollow}
              disabled={isFollowing}
            >
              {isFollowing
                ? 'Loading...'
                : amIFollowing
                  ? 'Unfollow'
                  : 'Follow'}
            </button>
          )}
          {(coverImg || profileImg) && isMyProfile && (
            <button
              className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
              onClick={handleUpdateImages}
              disabled={isUpdatingImages}
            >
              {isUpdatingImages ? 'Updating...' : 'Update'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-14 px-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{user.fullName}</span>
            <span className="text-sm text-slate-500">@{user.username}</span>
            <span className="text-sm my-1">{user.bio}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {user.link && (
              <div className="flex gap-1 items-center">
                <FaLink className="w-3 h-3 text-slate-500" />
                <a
                  href={user.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {user.link}
                </a>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <IoCalendarOutline className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">
                {formatJoinDate(user.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user.following?.length || 0}
              </span>
              <span className="text-slate-500 text-xs">Following</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-bold text-xs">
                {user.followers?.length || 0}
              </span>
              <span className="text-slate-500 text-xs">Followers</span>
            </div>
          </div>
        </div>

        <div className="flex w-full border-b border-gray-700 mt-4">
          <div
            className={`flex justify-center flex-1 p-3 ${feedType === 'posts' ? 'text-white' : 'text-slate-500'} hover:bg-secondary transition duration-300 relative cursor-pointer`}
            onClick={() => setFeedType('posts')}
          >
            Posts
            {feedType === 'posts' && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
            )}
          </div>
          <div
            className={`flex justify-center flex-1 p-3 ${feedType === 'likes' ? 'text-white' : 'text-slate-500'} hover:bg-secondary transition duration-300 relative cursor-pointer`}
            onClick={() => setFeedType('likes')}
          >
            Likes
            {feedType === 'likes' && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
            )}
          </div>
        </div>

        <Posts feedType={feedType} username={username} userId={user._id} />
      </div>
    </div>
  );
};

export default ProfilePage;
