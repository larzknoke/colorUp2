import Head from "next/head";
import Image from "next/image";
import UploadForm from "../components/uploadForm";
import { Divider, Flex, Heading, VStack, Box, HStack } from "@chakra-ui/react";
import LastUploads from "../components/lastUploads";

export default function Home() {
  return (
    <VStack gap={8} align="left">
      <Flex>
        <UploadForm />
      </Flex>
      <Divider />
      <Box>
        <Heading size="md" mb={5}>
          Ihre letzten Uploads:
        </Heading>
        <LastUploads />
      </Box>
    </VStack>
  );
}
