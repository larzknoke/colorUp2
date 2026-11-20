import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
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
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import {
  FaGithub,
  FaDiscord,
  FaYoutube,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from "next-firebase-auth";
import { changePassword, firebaseErrors, logout } from "../lib/firebase";

function HeaderContent() {
  const AuthUser = useAuthUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [loading, setLoading] = useState(false);

  const closePasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordRepeat("");
    onClose();
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordRepeat) {
      toast({
        title: "Passwörter stimmen nicht überein.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Passwort zu schwach.",
        description: "Bitte mindestens 6 Zeichen verwenden.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: "Passwort geändert",
        status: "success",
        duration: 6000,
        isClosable: true,
      });
      closePasswordModal();
    } catch (error) {
      const errorCode = error.code || error.message;
      const description =
        errorCode === "auth/operation-not-supported"
          ? "Für dieses Konto ist eine Passwortänderung nicht verfügbar."
          : firebaseErrors[errorCode] ||
            "Das Passwort konnte nicht geändert werden.";
      toast({
        title: "Ein Fehler ist aufgetreten.",
        description,
        status: "error",
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <HStack spacing="5">
            <Menu>
              <MenuButton
                as={Button}
                leftIcon={<FaUserCircle />}
                rightIcon={<FaChevronDown />}
              >
                {AuthUser?.email ? AuthUser.email : "-"}
              </MenuButton>
              <MenuList>
                {AuthUser?.claims?.admin && (
                  <NextLink href="/admin" passHref>
                    <MenuItem>Admin</MenuItem>
                  </NextLink>
                )}
                <MenuItem onClick={onOpen}>Passwort ändern</MenuItem>
                <MenuItem onClick={() => logout()}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen} onClose={closePasswordModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Passwort ändern</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Aktuelles Passwort</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Neues Passwort</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Neues Passwort wiederholen</FormLabel>
                <Input
                  type="password"
                  value={newPasswordRepeat}
                  onChange={(event) =>
                    setNewPasswordRepeat(event.target.value)
                  }
                  autoComplete="new-password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closePasswordModal} isDisabled={loading}>
              Abbrechen
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleChangePassword}
              isLoading={loading}
              isDisabled={
                !currentPassword || !newPassword || !newPasswordRepeat
              }
            >
              Passwort ändern
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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

export default withAuthUser()(Navbar);
