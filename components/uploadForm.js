import { useState, useRef } from "react";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  Icon,
  Flex,
  Text,
  VStack,
  HStack,
  Textarea,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useUploads } from "../lib/useUploads";
import { withAuthUser } from "next-firebase-auth";
import axios from "axios";

function UploadForm() {
  const { mutate } = useUploads();
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgess] = useState(0);

  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("selectedFile: ", selectedFile);
      if (selectedFile.length == 0) {
        setError("Keine Datei ausgewählt.");
        return;
      }

      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("note", note);
      [...selectedFile].map((file) => {
        formData.append(file.name, file);
      });
      const fileUpload = await axios.post("api/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        onUploadProgress: function (progressEvent) {
          setProgess(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        },
      });

      if (fileUpload.data.success) {
        mutate();
        setNote("");
        setOrderId("");
        setSelectedFile([]);
        setIsLoading(false);
        setProgess(0);

        toast({
          title: "Upload erfolgreich 👍",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Ein Fehler ist aufgetreten.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log("error: ", error);
      setIsLoading(false);
      setError(error.response.data.message || error.message);
    }
  };

  return (
    <VStack gap={5}>
      <form onSubmit={onSubmit}>
        <HStack gap={10} align="center" h="100%">
          <Flex
            bg={"gray.700"}
            h="100%"
            w="300px"
            borderRadius={3}
            alignItems="center"
            p={4}
            _hover={{ bg: "gray.600", cursor: "pointer", gap: "10px" }}
            transition="all 0.2s"
            flexDirection="column"
            justifyContent="center"
            gap={1}
            onClick={handleClick}
          >
            <Icon as={FaCloudUploadAlt} w={"80px"} h={"80px"} />
            <Text
              textAlign="center"
              maxWidth="250px"
              maxHeight="150px"
              overflow="hidden"
              textOverflow="ellipsis"
              sx={{
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                display: "-webkit-inline-box",
              }}
            >
              {Array.from(selectedFile).length > 0
                ? `${selectedFile.length} Dateien: ` +
                  Array.from(selectedFile)
                    .map((upload) => upload.name)
                    .join(", ")
                : "Datei auswählen..."}
            </Text>
            <FormControl>
              <Input
                display={"none"}
                onChange={changeHandler}
                ref={inputRef}
                type="file"
                multiple={true}
              />
            </FormControl>
          </Flex>{" "}
          <VStack w={"50%"} gap={5}>
            <FormControl>
              <FormLabel htmlFor="orderId">Name / Auftrags-Nr. </FormLabel>
              <Input
                id="orderId"
                name="orderId"
                onChange={(e) => setOrderId(e.target.value)}
                value={orderId}
                required={true}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="note">
                Notiz{" "}
                <Text as="span" color="gray.600">
                  (optional)
                </Text>
              </FormLabel>
              <Textarea
                value={note}
                id="note"
                name="note"
                onChange={(e) => setNote(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="teal"
              w={"100%"}
              variant="solid"
              isLoading={isLoading}
              type="submit"
            >
              Upload
            </Button>
          </VStack>
        </HStack>
      </form>
      {progress && (
        <Progress
          width={"100%"}
          hasStripe
          value={progress}
          colorScheme={"teal"}
        ></Progress>
      )}
      {error && (
        <Alert status={error ? "error" : "success"} borderRadius={5} my={2}>
          <AlertIcon />
          <AlertDescription>{error || message}</AlertDescription>
        </Alert>
      )}
    </VStack>
  );
}

export default withAuthUser()(UploadForm);
