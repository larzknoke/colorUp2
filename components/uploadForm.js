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
} from "@chakra-ui/react";
import { uploadFromBlobAsync } from "../lib/firebase";
import { FaCloudUploadAlt } from "react-icons/fa";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState();
  const [orderId, setOrderId] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

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
    setMessage(null);

    try {
      await uploadFromBlobAsync({
        blobUrl: URL.createObjectURL(selectedFile),
        name: `${selectedFile.name}_${Date.now()}`,
      }).then(async (url) => {
        const formData = {
          orderId: orderId || "-",
          note: note || "-",
          fileUrl: url,
        };
        console.log("url", url);
        const docRef = await addDoc(dbUploads, formData);
        console.log("docRef", docRef);

        setNote("");
        setOrderId("");
        setSelectedFile(null);
        setMessage("Datei erfolgreich hochgeladen 👍");
        setIsLoading(false);
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
      {(error || message) && (
        <Alert status={error ? "error" : "success"} borderRadius={5} my={2}>
          <AlertIcon />
          <AlertDescription>{error || message}</AlertDescription>
        </Alert>
      )}
    </VStack>
  );
}
