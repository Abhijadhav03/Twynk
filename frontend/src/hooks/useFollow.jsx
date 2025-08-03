import { useMutation , useMutationState, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';


const useFollow = () => {
  
    const queryClient = useQueryClient();

    const {mutate: follow, isLoading} = useMutation ({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/v1/users/${userId}/follow`, {
                    method: 'POST',
                    credentials: 'include',
                });
                const data = await res.json();
                console.log(data);
                if (!res.ok) {
                    throw new Error(data.message || 'Something went wrong');
                }
                return data;
                
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['authUser'] }),
                queryClient.invalidateQueries({ queryKey: ['users'] }),
            ])
            toast.success('followed successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['authUser'] });
        },
        onError: error => {
            toast.error(error.message);
        },
    })
    return {follow, isLoading};

}

export default useFollow;