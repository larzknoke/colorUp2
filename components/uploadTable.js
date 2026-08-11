import React, { useEffect, useState } from "react";
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
  HStack,
  Text,
} from "@chakra-ui/react";
import { FaTrashAlt, FaDownload, FaLink } from "react-icons/fa";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useUploads, useAdminUploads } from "../lib/useUploads";

function UploadTable({ uploads, admin = false }) {
  const uploadData = uploads;
  const toast = useToast();
  const { mutate } = useUploads();
  const { mutate: adminMutate } = useAdminUploads();
  const [shareLink, setShareLink] = useState("");

  const isShareExpired = (upload) =>
    Boolean(upload?.shareExpiresAt && upload.shareExpiresAt <= Date.now());

  const copyToClipboard = async (text) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (error) {
      console.error("Clipboard copy failed", error);
      return false;
    }
  };

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

  const getDownload = (id) => {
    window.open(`api/uploads/${id}`, "_blank");
  };

  const handleCreateShareLink = async (upload) => {
    try {
      const res = await axios.patch(
        `api/uploads/${upload.id}`,
        {},
        { withCredentials: true },
      );

      if (res.status !== 200) {
        return toast({
          title: "Ein Fehler ist aufgetreten.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }

      const link = `${window.location.origin}/api/uploads/share/${res.data.shareId}`;
      const expiresAt = res.data.shareExpiresAt;
      const validUntil = expiresAt
        ? new Date(expiresAt).toLocaleString()
        : "unbekannt";
      setShareLink(link);
      const copied = await copyToClipboard(link);
      mutate();
      adminMutate();
      toast({
        title: copied
          ? `Freigabe-Link erstellt und kopiert.\nGültig bis: ${validUntil}`
          : `Freigabe-Link erstellt.\nGültig bis: ${validUntil}`,
        description: link,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Freigabe-Link konnte nicht erstellt werden.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
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
                  <Tr key={upload.id} data-group={upload.uploadGroup}>
                    <Td>{upload.orderId}</Td>
                    <Td>{new Date(upload.createdAt).toLocaleDateString()}</Td>
                    <Td maxWidth={"500px"} whiteSpace={"normal"}>
                      {upload.note}
                    </Td>
                    <Td>{upload.fileName}</Td>
                    <Td>
                      <HStack spacing={2} justify="flex-end">
                        {admin && (
                          <Tooltip
                            placement="top"
                            label={
                              upload.shareId
                                ? "Link kopieren"
                                : "Freigabe-Link erzeugen"
                            }
                            aria-label="Share Tooltip"
                          >
                            <Button
                              variant={"ghost"}
                              onClick={() => {
                                if (
                                  upload.shareId &&
                                  !upload.shareUsed &&
                                  !isShareExpired(upload)
                                ) {
                                  const link = `${window.location.origin}/api/uploads/share/${upload.shareId}`;
                                  setShareLink(link);
                                  copyToClipboard(link).then((copied) => {
                                    toast({
                                      title: copied
                                        ? `Link kopiert.\nGültig bis: ${new Date(upload.shareExpiresAt).toLocaleString()}`
                                        : `Link vorbereitet.\nGültig bis: ${new Date(upload.shareExpiresAt).toLocaleString()}`,
                                      description: link,
                                      status: "success",
                                      duration: 9000,
                                      isClosable: true,
                                    });
                                  });
                                  return;
                                }
                                handleCreateShareLink(upload);
                              }}
                            >
                              <Icon as={FaLink} />
                            </Button>
                          </Tooltip>
                        )}
                        {admin && isShareExpired(upload) && (
                          <Text as="span" fontSize="sm" color="red.500">
                            abgelaufen
                          </Text>
                        )}
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
                            onClick={() => getDownload(upload.id)}
                          >
                            <Icon as={FaDownload} />
                          </Button>
                        </Tooltip>
                      </HStack>
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
