import useSWR from "swr";
import fetcher from "../utils/fetcher";

export const useUploads = () => {
  const { data, error, mutate } = useSWR(`/api/uploads`, fetcher);
  return {
    data: data,
    isError: error,
    mutate: mutate,
  };
};

export const useAdminUploads = () => {
  const { data, error, mutate } = useSWR(`/api/uploads?admin=true`, fetcher);
  return {
    data: data,
    isError: error,
    mutate: mutate,
  };
};
