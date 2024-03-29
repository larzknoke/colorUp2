import { bucket } from "../../../lib/firebase-admin";
import { withAuth } from "../../../lib/middlewares";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import initAuth from "../../../lib/initAuth";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
const { readdirSync, rmSync } = require("fs");

export const config = {
  api: { bodyParser: false },
};

initAuth();
const firestore = getFirestore();

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
      const bucket = getStorage().bucket();
      const filesArr = Object.values(files);
      const uploadGroup = uuidv4();

      const uploads = await Promise.all(
        filesArr.map(async (file) => {
          const fileName = file.originalFilename
            .toLowerCase()
            .split(" ")
            .join("-");
          return await bucket
            .upload(file.filepath, {
              destination: `${req.userId}/${uploadGroup}/${fileName}`,
            })
            .then(async (uploadRef) => {
              readdirSync(".tmp").forEach((f) => rmSync(`${".tmp"}/${f}`)); // empty .tmp folder
              const fileUrl = uploadRef[0].metadata.mediaLink;
              const name = uploadRef[0].metadata.name;
              const docRef = await firestore.collection("uploads").add({
                orderId: fields.orderId,
                note: fields.note,
                fileName: fileName,
                filePath: name,
                fileUrl: fileUrl,
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
        })
      );
      if (uploads.length > 0) {
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
          }
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

    snapshot.forEach(async (doc) => {
      console.log("doc: ", doc.id, doc.data().filePath);
      // const filePath = doc.data().filePath;
      // await bucket.file(filePath).delete();
      await doc.ref.delete();
    });
    return res.status(200).json({ success: true });
  }
};

export default withAuth(handler);
