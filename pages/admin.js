import React from "react";
import ProtectedRoute from "../components/protectedRoute";
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
          {(query != "" ? filteredUploads : groupedUploads)
            // .sort((a, b) => a[0].localeCompare(b[0]))
            .map((k) => {
              return (
                <div key={k}>
                  <Heading size="md" mb={5} mt={12}>
                    {k[0]}
                  </Heading>
                  <Accordion allowToggle>
                    {Object.entries(k[1]).map((gk) => {
                      return (
                        <div key={gk[0]} data-group={gk[0]}>
                          <Heading size="sm">{/* {gk[0]} */}</Heading>
                          <AccordionItem>
                            <h2>
                              <AccordionButton>
                                <Box as="span" flex="1" textAlign="left">
                                  {new Date(
                                    gk[1][0].createdAt
                                  ).toLocaleDateString()}{" "}
                                  <Text as="span" color="gray.600">
                                    :: {gk[1][0].orderId}
                                  </Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
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
