import useSWR from "swr";
import fetcher from "../utils/fetcher";
import nookies from "nookies";
import { useAuth } from "../context/AuthContext";

const useUsers = () => {
  const { user } = useAuth();
  const cookies = nookies.get();
  const { data, error, mutate } = useSWR(
    user ? [`/api/users`, cookies.token] : null,
    fetcher
  );
  return {
    data: data?.users,
    isError: error,
    mutate: mutate,
  };
};

export { useUsers };
