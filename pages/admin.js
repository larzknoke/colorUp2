import React from "react";
import axios from "axios";
import UploadTable from "../components/uploadTable";
import { useAdminUploads, useUploads } from "../lib/useUploads";
import grouper from "../utils/grouper";
import { filter, Heading } from "@chakra-ui/react";
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
} from "@chakra-ui/react";
import UserList from "../components/userList";
import { useState, useEffect } from "react";
import _ from "underscore";

function Admin() {
  const { data: dataUploads } = useAdminUploads();
  const [groupedUploads, setGroupedUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [query, setQuery] = useState("");

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

  const getDownloadGroup = (e, id) => {
    e.preventDefault();
    axios
      .get(`api/uploads/${id}?isGroup=true`, {
        withCredentials: false,
        responseType: "blob",
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
        const file = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/zip" })
        );
        window.open(file);
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
                              <Button
                                as="span"
                                colorScheme="teal"
                                size="xs"
                                mr={3}
                                onClick={(e) =>
                                  getDownloadGroup(e, gk[1][0].id)
                                }
                              >
                                Download
                              </Button>
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
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default Admin;
