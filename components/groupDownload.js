import { Button, useToast } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

function GroupDownloadButton({ id }) {
  const [groupLoading, setGroupLoading] = useState(false);
  const toast = useToast();

  const getDownloadGroup = (e, id) => {
    e.preventDefault();
    setGroupLoading(true);
    axios
      .get(`api/uploads/${id}?isGroup=true`, {
        withCredentials: false,
        responseType: "blob",
      })
      .then((res) => {
        if (res.status != 200) {
          return toast({
            title: "Ein Fehler ist aufgetreten.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
        const file = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/zip" })
        );
        window.open(file);
        setGroupLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setGroupLoading(false);
        return toast({
          title: "Ein Fehler ist aufgetreten.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  };

  return (
    <Button
      as="span"
      colorScheme="teal"
      size="xs"
      mr={3}
      isLoading={groupLoading}
      onClick={(e) => getDownloadGroup(e, id)}
    >
      Download
    </Button>
  );
}

export default GroupDownloadButton;
