import { withAuthUser, AuthAction } from "next-firebase-auth";
import { IconButton, Spinner } from "@chakra-ui/react";
import React from "react";
import axios from "axios";
import grouper from "../utils/grouper";
import UploadTable from "../components/uploadTable";
import { useAdminUploads, useUploads } from "../lib/useUploads";
import { Heading } from "@chakra-ui/react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Code,
  VStack,
  Checkbox,
  CheckboxGroup,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import UserList from "../components/userList";
import { useState, useEffect } from "react";
import _ from "underscore";
import GroupDownloadButton from "../components/groupDownload";

function Admin() {
  const { data: dataUploads, mutate: uploadMutate } = useAdminUploads();
  const [groupedUploads, setGroupedUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [deleteGroup, setDeleteGroup] = useState([]);
  const [query, setQuery] = useState("");
  const [importFile, setImportFile] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  useEffect(() => {
    if (dataUploads) {
      const group = _.groupByMulti(dataUploads?.uploads, [
        "userEmail",
        "uploadGroup",
      ]);
      setGroupedUploads(Object.entries(group));
      filterUploads();
    }
  }, [dataUploads, query]);

  const filterUploads = () => {
    const filteredResult = Object.values(dataUploads.uploads).filter(
      (upload) => {
        return Object.keys(upload).some((k) => {
          return upload[k]
            .toString()
            .toLowerCase()
            .includes(query.toLowerCase());
        });
      }
    );
    const group = _.groupByMulti(filteredResult, ["userEmail", "uploadGroup"]);
    setFilteredUploads(Object.entries(group));
  };

  const userResetEmail = (e) => {
    e.preventDefault();
    axios
      .get("api/mailer/userReset", { withCredentials: true })
      .then((res) => {
        if (res.status != 200) {
          return toast({
            title: "Ein Fehler ist aufgetreten.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
        onClose();
        return toast({
          title: "Reset Email wurde an alle Benutzer verschickt.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.log(error);
        return toast({
          title: "Ein Fehler ist aufgetreten.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
  };

  const importUser = async () => {
    try {
      const fileUpload = await axios.post("api/users/importUser", importFile, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast({
        title: "Import erfolgreich",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (success) {
      toast({
        title: error.response.data.error,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log("error", error.response.data.error);
    }
  };

  const handleCheckbox = (e) => {
    if (e.target.checked === true) {
      setDeleteGroup([...deleteGroup, e.target.value]);
    } else if (e.target.checked === false) {
      let freshArray = deleteGroup.filter((val) => val !== e.target.value);
      setDeleteGroup([...freshArray]);
    }
  };

  const handleDeleteGroup = () => {
    axios
      .delete(`api/uploads?groupids=${deleteGroup.join(",")}`)
      .then((data) => {
        toast({
          title: "Uploads gelöscht.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        uploadMutate();
        setDeleteGroup([]);
      })
      .catch((error) => {
        toast({
          title: "Ein Fehler ist aufgetreten.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.log("deleteError: ", error);
      });
  };

  useEffect(() => {
    console.log("deleteGroup: ", deleteGroup);
  }, [deleteGroup]);

  const getDownload = (e, id) => {
    e.preventDefault();
    axios
      .get(`api/uploads/${id}`, {
        withCredentials: false,
      })
      .then((res) => {
        if (res.status != 200) {
          return toast({
            title: "Ein Fehler ist aufgetreten.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
        window.open(res.data.signedUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Tabs>
      <TabList>
        <Tab>Uploads</Tab>
        <Tab>Benutzer</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {deleteGroup.length > 0 && (
            <Tooltip
              placement="top"
              label="Markierte löschen"
              aria-label="Delete Tooltip"
            >
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                size={"md"}
                float="right"
                ml={5}
                onClick={handleDeleteGroup}
              />
            </Tooltip>
          )}
          <Input
            placeholder="Suche"
            w={"33%"}
            float="right"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {(query != "" ? filteredUploads : groupedUploads).map((k) => {
            return (
              <div key={k}>
                <Heading size="md" mb={5} mt={12}>
                  {k[0]}
                </Heading>
                <Accordion allowToggle>
                  {Object.entries(k[1])
                    .sort((a, b) => b[1][0].createdAt - a[1][0].createdAt)
                    .map((gk) => {
                      return (
                        <div key={gk[0]} data-group={gk[0]}>
                          <AccordionItem>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                {gk[1][0].orderId}
                                <Text as="span" color="gray.600">
                                  {" :: "}
                                  {new Date(
                                    gk[1][0].createdAt
                                  ).toLocaleDateString()}
                                </Text>
                              </Box>
                              {gk[1].length > 1 ? (
                                <GroupDownloadButton id={gk[1][0].id} />
                              ) : (
                                <Button
                                  as="span"
                                  colorScheme="teal"
                                  size="xs"
                                  mr={3}
                                  onClick={(e) => getDownload(e, gk[1][0].id)}
                                >
                                  Download
                                </Button>
                              )}
                              <Checkbox
                                value={gk[0]}
                                isChecked={deleteGroup.includes(gk[0])}
                                onChange={handleCheckbox}
                                mr={3}
                                defaultChecked
                                colorScheme="teal"
                              ></Checkbox>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel
                              py={5}
                              bg="gray.700"
                              my={6}
                              borderRadius={4}
                            >
                              <UploadTable uploads={gk[1]} admin={true} />
                            </AccordionPanel>
                          </AccordionItem>
                        </div>
                      );
                    })}
                </Accordion>
              </div>
            );
          })}
        </TabPanel>
        <TabPanel>
          <UserList />
          <HStack spacing={4} float="right">
            <Button size="sm" my={3} onClick={onOpen}>
              Benutzer Reset Email
            </Button>
            <Button size="sm" my={3} onClick={onImportOpen}>
              User Import
            </Button>
          </HStack>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Bestätigung</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                Wollen Sie wirklich allen Benutzern eine Passwort-Reset-Email
                schicken?
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose} size="sm">
                  Abbrechen
                </Button>
                <Button onClick={userResetEmail} colorScheme="red" size="sm">
                  Abschicken
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isOpen={isImportOpen} onClose={onImportClose} size={"xl"}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Benutzer Import</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align={"left"}>
                  <Text>
                    Bitte Datei mit Benutzern auswählen und importieren.
                  </Text>
                  <Code>
                    {JSON.stringify({
                      users: [
                        {
                          email: "max@muster.de",
                          password: "1234",
                        },
                      ],
                    })}
                  </Code>
                  <input
                    type="file"
                    name="importFile"
                    onChange={(e) => setImportFile(e.target.files[0])}
                  />
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button mr={3} onClick={onImportClose} size="sm">
                  Abbrechen
                </Button>
                <Button onClick={importUser} colorScheme="blue" size="sm">
                  Importieren
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  LoaderComponent: Spinner,
})(Admin);
