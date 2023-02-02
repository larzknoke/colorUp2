import Head from "next/head";
import Navbar from "./navbar";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();
  const showHeader = router.pathname === "/login" ? false : true;

  return (
    <>
      <Head>
        <title>UP+ by COLOR+ GmbH</title>
        <meta name="description" content="Upload Tool by COLOR+ GmbH" />
      </Head>
      {showHeader && <Navbar />}
      <Container maxW="8xl" py={8}>
        {children}
      </Container>
    </>
  );
}
