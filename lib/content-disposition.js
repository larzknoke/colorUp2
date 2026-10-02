const encodeRFC5987Value = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

export const createAttachmentHeader = (fileName) => {
  const utf8FileName = String(fileName || "download");
  const asciiFileName = utf8FileName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/(["\\])/g, "\\$1");

  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodeRFC5987Value(
    utf8FileName,
  )}`;
};
