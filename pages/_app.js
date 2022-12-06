import Layout from "../components/layout";
import Login from "./login";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthContextProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import "../styles/globals.css";
import theme from "../lib/theme";
import ProtectedRoute from "../components/protectedRoute";

function App({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </AuthContextProvider>
  );
}

export default App;
