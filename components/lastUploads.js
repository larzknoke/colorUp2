import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Button,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { FaTrashAlt, FaDownload } from "react-icons/fa";

function LastUploads() {
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Datum</Th>
            <Th>Notiz</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>Book.pdf</Td>
            <Td>12.12.2022</Td>
            <Td>Das ist eine Noitz</Td>
            <Td>
              <Tooltip
                placement="top"
                label="Datei löschen"
                aria-label="Delete Tooltip"
              >
                <Button variant={"ghost"}>
                  <Icon as={FaTrashAlt} />
                </Button>
              </Tooltip>
              <Tooltip
                placement="top"
                label="Datei herunterladen"
                aria-label="Delete Tooltip"
              >
                <Button variant={"ghost"}>
                  <Icon as={FaDownload} />
                </Button>
              </Tooltip>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default LastUploads;
