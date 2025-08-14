import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isLoading: isFollowing } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/v1/users/follow/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Something went wrong');
        }
        console.log(data);
        
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Invalidate both queries once
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['authUser'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ])
  
      toast.success('Followed successfully');
     
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { follow, isFollowing };
};

export default useFollow;
