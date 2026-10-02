import { firestore } from "../../../../lib/firebase-admin";
import { createUploadReadStream } from "../../../../lib/local-upload-storage";
import { createAttachmentHeader } from "../../../../lib/content-disposition";

const pipeStream = (stream, res) =>
  new Promise((resolve, reject) => {
    stream.on("error", reject);
    res.on("finish", resolve);
    stream.pipe(res);
  });

const handler = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shareId } = req.query;

  if (!shareId) {
    return res.status(400).json({ error: "Freigabe-Link fehlt." });
  }

  try {
    const snapshot = await firestore
      .collection("uploads")
      .where("shareId", "==", shareId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Freigabe-Link ungültig." });
    }

    const uploadDoc = snapshot.docs[0];
    const upload = uploadDoc.data();
    const { filePath, fileName, shareExpiresAt } = upload;

    if (shareExpiresAt && shareExpiresAt <= Date.now()) {
      await uploadDoc.ref.update({
        shareId: null,
        shareExpiresAt: null,
      });
      return res.status(410).json({ error: "Freigabe-Link ist abgelaufen." });
    }

    res
      .status(200)
      .setHeader("Content-Type", "application/octet-stream")
      .setHeader("Content-Disposition", createAttachmentHeader(fileName));

    await pipeStream(createUploadReadStream(filePath), res);
    return res;
  } catch (error) {
    console.log("share error: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
