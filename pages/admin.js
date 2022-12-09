import React from "react";
import ProtectedRoute from "../components/protectedRoute";
import UploadTable from "../components/uploadTable";
import { useAdminUploads, useUploads } from "../lib/useUploads";
import { useUsers } from "../lib/useUsers";
import grouper from "../utils/grouper";
import { Heading } from "@chakra-ui/react";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import UserList from "../components/userList";

function Admin() {
  const { data: dataUploads } = useAdminUploads();
  const { data: dataUsers } = useUsers();

  if (dataUploads)
    var groupedUploads = grouper(dataUploads?.uploads, (v) => v.userEmail);

  return (
    <ProtectedRoute>
      <Tabs>
        <TabList>
          <Tab>Uploads</Tab>
          <Tab>Benutzer</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {dataUploads &&
              Object.entries(groupedUploads).map((k) => {
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
          <TabPanel>{dataUsers && <UserList users={dataUsers} />}</TabPanel>
        </TabPanels>
      </Tabs>
    </ProtectedRoute>
  );
}

export default Admin;
