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
  });

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  const handleShowClick = () => setShowPassword(!showPassword);

  const handleLogin = async () => {
    console.log("formdata: ", data);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignUp = async () => {
    console.log("sign up");
    await signup(data.email, data.password)
      .then((data) => {
        toast({
          title: "Registrierung erfolgreich",
          description: `${data.email} erfolgreich registriert`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: "Ein Fehler ist aufgetreten.",
          description: `${err}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
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
          <form>
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
                    placeholder="email address"
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
                    placeholder="Password"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText textAlign="right">
                  <Link>forgot password?</Link>
                </FormHelperText>
              </FormControl>
              <Button
                variant="solid"
                colorScheme="gray.700"
                bg="gray.500"
                width="full"
                onClick={() => (doSignUp ? handleSignUp() : handleLogin())}
              >
                {doSignUp ? "Registrieren" : "Login"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        Neu hier?{" "}
        <Link color="gray.500" onClick={() => setDoSignUp(true)}>
          Registrieren
        </Link>
      </Box>
    </Flex>
  );
};

export default Login;
