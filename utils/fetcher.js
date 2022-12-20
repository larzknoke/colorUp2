import axios from "axios";

const fetcher = async (url) => {
  const res = await axios.get(url, { withCredentials: true });
  if (res.status != 200) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
    // throw error would cause useSWR to retry, and it seems to fix the issue of firebase expired token
  }

  return res.data;
};

export default fetcher;
