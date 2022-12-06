import UploadForm from "../components/uploadForm";
import { Divider, Flex, Heading, VStack, Box } from "@chakra-ui/react";
import LastUploads from "../components/lastUploads";
import ProtectedRoute from "../components/protectedRoute";
import useUploads from "../lib/useUploads";

export default function Home() {
  const { data, error, mutate } = useUploads();

  return (
    <ProtectedRoute>
      <VStack gap={8} align="left">
        <Flex>
          <UploadForm />
        </Flex>
        <Divider />
        <Box>
          <Heading size="md" mb={5}>
            Ihre letzten Uploads:
          </Heading>
          <LastUploads uploads={data?.uploads} />
        </Box>
      </VStack>
    </ProtectedRoute>
  );
}
