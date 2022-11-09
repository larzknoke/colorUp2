import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Input,
  Button,
  FormHelperText,
  Icon,
  Flex,
  Text,
  VStack,
  SimpleGrid,
  GridItem,
  Grid,
  HStack,
  Textarea,
  Spacer,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FaFile, FaCloudUploadAlt } from "react-icons/fa";

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];

    if (!file) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await uploadFromBlobAsync({
        blobUrl: URL.createObjectURL(file),
        name: `${file.name}_${Date.now()}`,
      });
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return;
    }

    setIsLoading(false);
    setMessage("File was uploaded 👍");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  function onSubmit(values) {
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        resolve();
      }, 3000);
    });
  }

  const validateFiles = (value) => {
    if (value.length < 1) {
      return "Datei wird benötigt.";
    }
    for (const file of Array.from(value)) {
      const fsMb = file.size / (1024 * 1024);
      const MAX_FILE_SIZE = 10;
      if (fsMb > MAX_FILE_SIZE) {
        return "Datei zu groß 10mb";
      }
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <HStack gap={10} align="center">
        <FormControl w={"50%"}>
          <Flex
            bg="gray.700"
            _hover={{ bg: "gray.600", cursor: "pointer" }}
            transition="background 0.2s"
            h={300}
            justify="center"
            align="center"
            p={50}
            my={5}
            borderRadius={5}
            textAlign="center"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {isLoading ? (
              <Spinner />
            ) : isDragActive ? (
              <Text as="b">Dateien hier ablegen...</Text>
            ) : (
              <VStack>
                <Icon as={FaCloudUploadAlt} color="gray.500" w={12} h={12} />
                <Text as="b" color="gray.500">
                  Dateien hier ablegen oder per Klck auswählen...
                </Text>
              </VStack>
            )}
          </Flex>
        </FormControl>
        <VStack w={"50%"} gap={5}>
          <FormControl isInvalid={errors.name}>
            <FormLabel htmlFor="orderId">Auftrags-Nr.</FormLabel>
            <Input
              id="orderId"
              {...register("orderId", {
                required: "This is required",
                minLength: { value: 4, message: "Minimum length should be 4" },
              })}
            />
            <FormErrorMessage>
              {errors.orderId && errors.orderId.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.name}>
            <FormLabel htmlFor="note">Notiz</FormLabel>
            <Textarea
              id="note"
              {...register("note", {
                required: "This is required",
                minLength: { value: 4, message: "Minimum length should be 4" },
              })}
            />
            <FormErrorMessage>
              {errors.note && errors.note.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="teal"
            w={"100%"}
            variant="solid"
            isLoading={isSubmitting}
            type="submit"
          >
            Upload
          </Button>
        </VStack>
      </HStack>

      {(error || message) && (
        <Alert
          status={error ? "error" : "success"}
          w={250}
          borderRadius={5}
          m={2}
        >
          <AlertIcon />
          <AlertDescription w={200}>{error || message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
