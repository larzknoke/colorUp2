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
} from "@chakra-ui/react";
import { uploadFromBlobAsync } from "../lib/firebase";
import { FaCloudUploadAlt } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import useUploads from "../lib/useUploads";

export default function UploadForm() {
  const { mutate } = useUploads();
  const { user } = useAuth();
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState();
  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputRef = useRef(null);
  const dbUploads = collection(db, "uploads");

  const handleClick = () => {
    inputRef.current?.click();
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Keine Datei ausgewählt.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await uploadFromBlobAsync({
        blobUrl: URL.createObjectURL(selectedFile),
        name: `${user.uid}/${Date.now()}/${selectedFile.name}`,
      }).then(async ({ url, filePath }) => {
        const formData = {
          userID: user.uid,
          orderId: orderId || "-",
          note: note || "-",
          fileUrl: url,
          createdAt: Date.now(),
          filePath: filePath,
        };
        const docRef = await addDoc(dbUploads, formData);

        mutate();
        setNote("");
        setOrderId("");
        setSelectedFile(null);
        setIsLoading(false);
        toast({
          title: "Datei erfolgreich hochgeladen 👍",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      });
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return;
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
            <Text textAlign="center">
              {selectedFile?.name || "Datei auswählen..."}
            </Text>
            <FormControl>
              <Input
                display={"none"}
                onChange={changeHandler}
                ref={inputRef}
                type="file"
              />
            </FormControl>
          </Flex>{" "}
          <VStack w={"50%"} gap={5}>
            <FormControl>
              <FormLabel htmlFor="orderId">Auftrags-Nr.</FormLabel>
              <Input
                id="orderId"
                name="orderId"
                onChange={(e) => setOrderId(e.target.value)}
                value={orderId}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="note">Notiz</FormLabel>
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
      {error && (
        <Alert status={error ? "error" : "success"} borderRadius={5} my={2}>
          <AlertIcon />
          <AlertDescription>{error || message}</AlertDescription>
        </Alert>
      )}
    </VStack>
  );
}
