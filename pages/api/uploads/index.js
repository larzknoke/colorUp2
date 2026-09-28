import { firestore } from "../../../lib/firebase-admin";
import { withAuth } from "../../../lib/middlewares";
import initAuth from "../../../lib/initAuth";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import {
  buildUploadPath,
  deleteUploadFile,
  ensureUploadRoot,
  storeUploadFile,
} from "../../../lib/local-upload-storage";
const { readdirSync, rmSync } = require("fs");

export const config = {
  api: { bodyParser: false },
};

initAuth();

const handler = async (req, res) => {
  if (req.method == "GET") {
    try {
      const snapshot =
        req.admin && req.query.admin
          ? await firestore.collection("uploads").get()
          : await firestore
              .collection("uploads")
              .where("userID", "==", req.userId)
              .get();

      const uploads = [];

      snapshot.forEach((doc) => {
        uploads.push({ id: doc.id, ...doc.data() });
      });

      return res.status(200).json({ uploads });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
  if (req.method == "POST") {
    await ensureUploadRoot();
    const form = new formidable.IncomingForm({
      uploadDir: "./.tmp",
      keepExtensions: true,
      multiples: true,
      maxFileSize: 500 * 1024 * 1024,
    });
    form.on("error", (err) => {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Datei ist ungültig." });
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Upload fehlgeschlagen." });
      }

      const filesArr = Object.values(files);
      const uploadGroup = uuidv4();

      const uploads = await Promise.all(
        filesArr.map(async (file) => {
          const fileName = file.originalFilename
            .toLowerCase()
            .split(" ")
            .join("-");
          const filePath = buildUploadPath({
            userId: req.userId,
            uploadGroup,
            fileName,
          });

          return await storeUploadFile({
            sourceFilePath: file.filepath,
            destinationPath: filePath,
          })
            .then(async () => {
              const docRef = await firestore.collection("uploads").add({
                orderId: fields.orderId,
                note: fields.note,
                fileName: fileName,
                filePath: filePath,
                userID: req.userId,
                userEmail: req.userEmail,
                createdAt: Date.now(),
                uploadGroup: uploadGroup,
              });
              console.log("docRef: ", docRef.id);
              if (!docRef.id)
                return res
                  .status(500)
                  .json({ error: "Ein Fehler ist aufgetreten." });
              // return uploadArr.push((await docRef.get()).data());
              const doc = (await docRef.get()).data();
              return Promise.resolve(doc);
            })
            .catch((err) => {
              console.log(err);
              return res.status(500).json({ success: false });
            });
        }),
      );

      readdirSync(".tmp").forEach((f) => rmSync(`${".tmp"}/${f}`)); // empty .tmp folder

      // Admin-Uploads lösen keine E-Mail-Benachrichtigung aus.
      if (uploads.length > 0 && !req.admin) {
        const resMail = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/mailer/newUpload`,
          {
            body: JSON.stringify({
              subject: `Neuer Upload von ${uploads[0].userEmail}`,
              userEmail: uploads[0].userEmail,
              orderId: uploads[0].orderId,
              note: uploads[0].note,
              fileName: uploads.map((u) => u.fileName).join(", "),
            }),
            headers: { "Content-Type": "application/json" },
            method: "POST",
          },
        );
      }
      return res.status(200).json({ success: true, uploads: uploads });
    });
  }
  if (req.method == "DELETE") {
    const groupIds = req.query.groupids.split(",");
    console.log("groupIds: ", groupIds);

    const snapshot = await firestore
      .collection("uploads")
      .where("uploadGroup", "in", groupIds)
      .get();

    await Promise.all(
      snapshot.docs.map(async (doc) => {
        console.log("doc: ", doc.id, doc.data().filePath);
        await deleteUploadFile(doc.data().filePath);
        await doc.ref.delete();
      }),
    );

    return res.status(200).json({ success: true });
  }
};

export default withAuth(handler);
