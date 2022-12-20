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
} from "@chakra-ui/react";
import UserList from "../components/userList";
import { useState, useEffect } from "react";

function Admin() {
  const { data: dataUploads } = useAdminUploads();
  const [groupedUploads, setGroupedUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (dataUploads) {
      const uploadsArray = Object.entries(
        grouper(dataUploads?.uploads, (v) => v.userEmail)
      );
      setGroupedUploads(uploadsArray);
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
    const groupedResult = Object.entries(
      grouper(filteredResult, (v) => v.userEmail)
    );
    setFilteredUploads(groupedResult);
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
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map((k) => {
              return (
                <div key={k}>
                  <Heading size="md" mb={5} mt={12}>
                    {k[0]}
                  </Heading>
                  <UploadTable uploads={k[1]} admin={true} />
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
