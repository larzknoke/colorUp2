import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { FaTrashAlt, FaDownload, FaCheck, FaCross } from "react-icons/fa";

function UserList({ users }) {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Email</Th>
            <Th>User ID</Th>
            <Th>Admin</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {users?.length > 0 &&
            users
              //   .sort(function (a, b) {
              //     return b.createdAt - a.createdAt;
              //   })
              .map((user) => {
                return (
                  <Tr key={user.uid}>
                    <Td>{user.email}</Td>
                    <Td>{user.uid}</Td>
                    <Td>{user.customClaims.admin && <Icon as={FaCheck} />}</Td>
                    <Td>
                      <Tooltip
                        placement="top"
                        label="Benutzer löschen"
                        aria-label="Delete Tooltip"
                      >
                        <Button
                          variant={"ghost"}
                          //   onClick={() => handleDelete(upload.id)}
                        >
                          <Icon as={FaTrashAlt} />
                        </Button>
                      </Tooltip>
                      {/* <Tooltip
                        placement="top"
                        label="Datei herunterladen"
                        aria-label="Delete Tooltip"
                      >
                        <Button
                          variant={"ghost"}
                        //   onClick={() => getDownload(upload.fileUrl)}
                        >
                          <Icon as={FaDownload} />
                        </Button>
                      </Tooltip> */}
                    </Td>
                  </Tr>
                );
              })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default UserList;
