import useSWR from "swr";
import fetcher from "../utils/fetcher";

const useUsers = () => {
  const { data, error, mutate } = useSWR("/api/users", fetcher);
  return {
    data: data?.users,
    isError: error,
    mutate: mutate,
  };
};

export { useUsers };
