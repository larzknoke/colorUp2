import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Icon,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { FaTrashAlt, FaCheck, FaUserAstronaut } from "react-icons/fa";
import nookies from "nookies";
import { useUsers } from "../lib/useUsers";

function UserList() {
  const { data: dataUsers, isError, mutate } = useUsers();
  const toast = useToast();
  const cookies = nookies.get();

  const setAdmin = async (uid) => {
    return fetch("api/users/setAdmin", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      }),
      credentials: "same-origin",
      body: JSON.stringify({ uid }),
    }).then((res) =>
      res.json().then((data) => {
        mutate();
        toast({
          title: "Admin gesetzt. 👍",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
    );
  };

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
          {dataUsers?.length > 0 &&
            dataUsers
              .sort((a, b) => {
                // console.log("dataUsers: ", dataUsers);
                // console.log("userA: ", a);
                // console.log("userB: ", b);
                return a.email.localeCompare(b.email);
              })
              .map((user) => {
                return (
                  <Tr key={user.uid}>
                    <Td>{user.email}</Td>
                    <Td>{user.uid}</Td>
                    <Td>{user.customClaims?.admin && <Icon as={FaCheck} />}</Td>
                    <Td>
                      <Tooltip
                        placement="top"
                        label="User zu Admin"
                        aria-label="Admin Tooltip"
                      >
                        <Button
                          variant={"ghost"}
                          onClick={() => setAdmin(user.uid)}
                          disabled={user.customClaims?.admin}
                        >
                          <Icon as={FaUserAstronaut} />
                        </Button>
                      </Tooltip>
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
