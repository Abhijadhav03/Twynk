import Post from './Post';
import PostSkeleton from '../skeletons/PostsSkeleton';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const Posts = ({ feedType = 'forYou', username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case 'forYou':
        return '/api/v1/posts/getall';
      case 'following':
        return '/api/v1/posts/following';
      case 'posts':
        return `/api/v1/posts/user/${username}`;
      case 'likes':
        return `/api/v1/posts/liked/${userId}`;
      default:
        return '/api/v1/posts/getall';
    }
  };

  const POST_ENDPOINT = getPostEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['posts', feedType, username],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Something went wrong');
        }
        return data.posts;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, username, refetch]);

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}

      {!isLoading && (!posts || posts.length === 0) && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}

      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
