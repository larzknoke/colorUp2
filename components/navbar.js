import { useAuth } from "../context/AuthContext";
import React from "react";
import NextLink from "next/link";
import {
  chakra,
  Container,
  Flex,
  Box,
  HStack,
  Link,
  Icon,
  Image,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  FaGithub,
  FaDiscord,
  FaYoutube,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";

function HeaderContent() {
  const { user, logout } = useAuth();

  return (
    <>
      <Flex w="100%" h="100%" align="center" justify="space-between">
        <Flex align="center">
          <NextLink href="/" passHref>
            {/* <Logo display={{ base: "none", md: "block" }} /> */}
            <Image
              src="/upPlus_logo.svg"
              alt="COLOR+ UP Logo"
              fit="contain"
              height="5rem"
            />
          </NextLink>
        </Flex>

        <Flex
          justify="flex-end"
          w="100%"
          align="center"
          color="gray.400"
          maxW="1100px"
        >
          <HStack spacing="5" display={{ base: "none", md: "flex" }}>
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FaUserCircle />}
                rightIcon={<FaChevronDown />}
              >
                {user?.email ? user.email : "-"}
              </MenuButton>
              <MenuList>
                {user?.admin && (
                  <NextLink href="/admin" passHref>
                    <MenuItem>Admin</MenuItem>
                  </NextLink>
                )}
                <MenuItem onClick={() => logout()}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Flex>
    </>
  );
}

function Navbar() {
  return (
    <Container maxW="8xl" color="white" height="10rem">
      <HeaderContent />
    </Container>
  );
}

export default Navbar;
