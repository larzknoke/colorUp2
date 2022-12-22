import { withAuth } from "../../../lib/middlewares";
import { firestore, storage, bucket } from "../../../lib/firebase-admin";
import JSZip from "jszip";
import fs from "fs";

const handler = async (req, res) => {
  const { id } = req.query;
  const docRef = firestore.collection("uploads").doc(id);

  if (req.method === "DELETE" && docRef) {
    try {
      const filePath = (await docRef.get()).data().filePath;
      const delFile = await bucket.file(filePath).delete();
      const delDoc = await docRef.delete();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "GET" && docRef) {
    try {
      const fileData = (await docRef.get()).data();
      const { filePath, userID, uploadGroup } = fileData;

      const jszip = new JSZip();
      const files = (
        await bucket.getFiles({
          prefix: `${userID}/${uploadGroup}`,
        })
      )[0];

      const filesContent = await Promise.all(
        files.map((file) => file.download())
      );

      filesContent.forEach((content, i) => {
        jszip.file(files[i].name, content[0]);
      });

      const content = await jszip.generateAsync({ type: "nodebuffer" });
      const zipFile = await fs.promises.writeFile(
        "./.tmp/download.zip",
        content,
        { encoding: "utf8" }
      );

      const downloadFile = fs.createReadStream(".tmp/download.zip");

      return res
        .status(200)
        .setHeader("Content-Type", "application/zip")
        .setHeader("Content-Disposition", `attachment; filename=download.zip`)
        .send(downloadFile);

      const signedUrl = await bucket.file(filePath).getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 1000 * 60 * 2,
      });
      console.log("signedUrl: ", signedUrl);
      return res.status(200).json({ success: true, signedUrl: signedUrl });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).json({ error: error.message });
    }
  }
};

export default withAuth(handler);
