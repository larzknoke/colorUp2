import Layout from "../components/layout";
import { ChakraProvider } from "@chakra-ui/react";
import "../styles/globals.css";
import theme from "../lib/theme";

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default App;
