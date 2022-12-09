import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  Image,
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  chakra,
  Box,
  Link,
  FormControl,
  FormHelperText,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { firebaseErrors } from "../lib/firebase";

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

const Login = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, login, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [doSignUp, setDoSignUp] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    password_validate: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  const handleShowClick = () => setShowPassword(!showPassword);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.log("login error", error.code);
      toast({
        title: "Ein Fehler ist aufgetreten.",
        description: firebaseErrors[error.code] || error.code,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    await signup(data.email, data.password)
      .then((data) => {
        toast({
          title: "Registrierung erfolgreich",
          description: `${data.email} erfolgreich registriert`,
          status: "success",
          duration: 6000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: "Ein Fehler ist aufgetreten.",
          description: `${err}`,
          status: "error",
          duration: 6000,
          isClosable: true,
        });
      });
    setLoading(false);
  };

  return (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
        gap={6}
      >
        <Image
          src="/upPlus_logo.svg"
          alt="COLOR+ UP Logo"
          fit="contain"
          height="6rem"
        />
        <Box bg="gray.800" minW={{ base: "90%", md: "468px" }}>
          <form onSubmit={(e) => (doSignUp ? handleSignUp(e) : handleLogin(e))}>
            <Stack spacing={8} p={7} backgroundColor="gray.700" boxShadow="md">
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<CFaUserAlt color="gray.500" />}
                  />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.500"
                    children={<CFaLock color="gray.500" />}
                  />
                  <Input
                    name="password"
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    type={showPassword ? "text" : "password"}
                    placeholder="Passwort"
                  />
                  <InputRightElement width="auto">
                    <Button
                      h="1.75rem"
                      size="sm"
                      mr={1}
                      onClick={handleShowClick}
                    >
                      {showPassword ? "Verstecken" : "Zeigen"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {!doSignUp && (
                  <FormHelperText textAlign="right">
                    <Link>Passwort vergessen?</Link>
                  </FormHelperText>
                )}
              </FormControl>
              {doSignUp && (
                <FormControl>
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      color="gray.500"
                      children={<CFaLock color="gray.500" />}
                    />
                    <Input
                      name="password_validate"
                      onChange={(e) =>
                        setData({ ...data, password_validate: e.target.value })
                      }
                      type={showPassword ? "text" : "password"}
                      placeholder="Passwort wiederholen"
                    />
                    <InputRightElement width="auto">
                      <Button
                        h="1.75rem"
                        size="sm"
                        mr={1}
                        onClick={handleShowClick}
                      >
                        {showPassword ? "Verstecken" : "Zeigen"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              )}
              <Button
                variant="solid"
                colorScheme="gray.700"
                bg="gray.500"
                _hover={{ bg: "gray.400" }}
                width="full"
                type="submit"
                isLoading={loading}
                disabled={
                  data?.email == "" ||
                  data?.password == "" ||
                  (doSignUp && data?.password != data?.password_validate)
                }
              >
                {doSignUp ? "Registrieren" : "Login"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        {!doSignUp ? (
          <>
            Neu hier?{" "}
            <Link color="gray.500" onClick={() => setDoSignUp(true)}>
              Registrieren
            </Link>
          </>
        ) : (
          <>
            Sie haben schon ein Konto?{" "}
            <Link color="gray.500" onClick={() => setDoSignUp(false)}>
              Login
            </Link>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default Login;
