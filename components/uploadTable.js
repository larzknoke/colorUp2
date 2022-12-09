import React, { useEffect, useState } from "react";
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
import { FaTrashAlt, FaDownload } from "react-icons/fa";
import { useToast } from "@chakra-ui/react";
import nookies from "nookies";
import { useUploads } from "../lib/useUploads";
import { useAdminUploads } from "../lib/useUploads";

function UploadTable({ uploads }) {
  const toast = useToast();
  const cookies = nookies.get();
  const { mutate } = useUploads();
  const { mutate: adminMutate } = useAdminUploads();

  const handleDelete = (id) => {
    fetch(`api/uploads/${id}`, {
      method: "DELETE",
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      }),
      credentials: "same-origin",
    })
      .then((res) => {
        if (!res.ok) {
          return toast({
            title: "Ein Fehler ist aufgetreten.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
        mutate();
        adminMutate();
        toast({
          title: "Upload gelöscht.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDownload = (url) => {
    console.log(url);
    window.open(url);
  };

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Auftrags-Nr.</Th>
            <Th>Datum</Th>
            <Th>Notiz</Th>
            <Th>Datei</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {uploads?.length > 0 &&
            uploads
              .sort(function (a, b) {
                return b.createdAt - a.createdAt;
              })
              .map((upload) => {
                return (
                  <Tr key={upload.id}>
                    <Td>{upload.orderId}</Td>
                    <Td>{new Date(upload.createdAt).toLocaleDateString()}</Td>
                    <Td>{upload.note}</Td>
                    <Td>{upload.fileName}</Td>
                    <Td>
                      <Tooltip
                        placement="top"
                        label="Datei löschen"
                        aria-label="Delete Tooltip"
                      >
                        <Button
                          variant={"ghost"}
                          onClick={() => handleDelete(upload.id)}
                        >
                          <Icon as={FaTrashAlt} />
                        </Button>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        label="Datei herunterladen"
                        aria-label="Delete Tooltip"
                      >
                        <Button
                          variant={"ghost"}
                          onClick={() => getDownload(upload.fileUrl)}
                        >
                          <Icon as={FaDownload} />
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

export default UploadTable;
