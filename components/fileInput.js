import { useMultiStyleConfig } from "@chakra-ui/react";
import { Input, Flex, Icon, FormControl } from "@chakra-ui/react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useRef, useState } from "react";

export const FileInput = () => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log("selectedFile");
    console.log(selectedFile);
  };

  return (
    <Flex
      bg={"gray.700"}
      h="100%"
      borderRadius={2}
      alignItems="center"
      p={4}
      _hover={{ bg: "gray.600", cursor: "pointer" }}
      transition="background 0.2s"
      flexDirection="column"
      justifyContent="center"
      gap={3}
      onClick={handleClick}
    >
      <Icon as={FaCloudUploadAlt} w={"80px"} h={"80px"} />
      <FormControl>
        <FormControl>
          <Input
            onChange={changeHandler}
            ref={inputRef}
            type="file"
            multiple
            sx={{
              "::file-selector-button": {
                height: 10,
                padding: 0,
                mr: 4,
                background: "none",
                border: "none",
                fontWeight: "bold",
              },
            }}
          />
        </FormControl>
      </FormControl>
    </Flex>
  );
};
