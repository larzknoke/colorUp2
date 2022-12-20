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
import axios from "axios";
import { useUploads, useAdminUploads } from "../lib/useUploads";

function UploadTable(uploads) {
  const uploadData = [...Object.values(uploads)][0];
  const toast = useToast();
  const { mutate } = useUploads();
  const { mutate: adminMutate } = useAdminUploads();

  const handleDelete = (id) => {
    axios
      .delete(`api/uploads/${id}`, {
        withCredentials: true,
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
          {uploadData?.length > 0 &&
            uploadData
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
