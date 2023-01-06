import UploadForm from "../components/uploadForm";
import { Divider, Flex, Heading, VStack, Box, Spinner } from "@chakra-ui/react";
import UploadTable from "../components/uploadTable";
import { useUploads } from "../lib/useUploads";
import useSWR from "swr";
import initAuth from "../lib/initAuth";
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";

initAuth();

function Home({ uploads }) {
  const AuthUser = useAuthUser();
  const { data, error, mutate } = useUploads();

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
        <UploadTable uploads={data?.uploads} />
      </Box>
    </VStack>
  );
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  LoaderComponent: Spinner,
})(Home);
