import { withAuth } from "../../../lib/middlewares";
import { firestore } from "../../../lib/firebase-admin";
import JSZip from "jszip";
import {
  createUploadReadStream,
  deleteUploadFile,
  readUploadFile,
} from "../../../lib/local-upload-storage";

const pipeStream = (stream, res) =>
  new Promise((resolve, reject) => {
    stream.on("error", reject);
    res.on("finish", resolve);
    stream.pipe(res);
  });

const handler = async (req, res) => {
  const { id, isGroup } = req.query;
  const docRef = firestore.collection("uploads").doc(id);

  if (req.method === "DELETE" && docRef) {
    try {
      const filePath = (await docRef.get()).data().filePath;
      await deleteUploadFile(filePath);
      await docRef.delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "GET" && docRef) {
    try {
      const fileData = (await docRef.get()).data();
      const { filePath, uploadGroup, fileName, userID } = fileData;

      if (isGroup) {
        const jszip = new JSZip();
        const snapshot = await firestore
          .collection("uploads")
          .where("userID", "==", userID)
          .where("uploadGroup", "==", uploadGroup)
          .get();

        const files = await Promise.all(
          snapshot.docs.map(async (uploadDoc) => {
            const upload = uploadDoc.data();
            const content = await readUploadFile(upload.filePath);
            return {
              content,
              fileName: upload.fileName,
            };
          }),
        );

        files.forEach((file) => {
          jszip.file(file.fileName, file.content);
        });

        const content = await jszip.generateAsync({ type: "nodebuffer" });

        return res
          .status(200)
          .setHeader("Content-Type", "application/zip")
          .setHeader(
            "Content-Disposition",
            `attachment; filename=${uploadGroup}.zip`,
          )
          .send(content);
      } else {
        res
          .status(200)
          .setHeader("Content-Type", "application/octet-stream")
          .setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`,
          );

        await pipeStream(createUploadReadStream(filePath), res);
        return res;
      }
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export default withAuth(handler);
