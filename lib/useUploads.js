import useSWR from "swr";
import fetcher from "../utils/fetcher";
import nookies from "nookies";
import { useAuth } from "../context/AuthContext";

const useUploads = () => {
  const { user } = useAuth();
  const cookies = nookies.get();
  const { data, error, mutate } = useSWR(
    user ? [`/api/uploads`, cookies.token] : null,
    fetcher
  );
  return {
    data: data,
    isError: error,
    mutate: mutate,
  };
};

const useAdminUploads = () => {
  const { user } = useAuth();
  const cookies = nookies.get();
  const { data, error, mutate } = useSWR(
    user ? [`/api/uploads?admin=true`, cookies.token] : null,
    fetcher
  );
  return {
    data: data,
    isError: error,
    mutate: mutate,
  };
};

export { useUploads, useAdminUploads };
