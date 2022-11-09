import Navbar from "./navbar";
import Footer from "./footer";
import { Container } from "@chakra-ui/react";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container maxW="8xl" py={8}>
        {children}
      </Container>
      {/* <Footer /> */}
    </>
  );
}
