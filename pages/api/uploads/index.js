import { withAuth } from "../../../lib/middlewares";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
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
      let host = req.headers.referer;
      const resMail = await fetch(`${host}/api/mailer/newUpload`, {
        body: JSON.stringify({
          subject: `Neuer Upload von ${uploads[0].userEmail}`,
          userEmail: uploads[0].userEmail,
          orderId: uploads[0].orderId,
          note: uploads[0].note,
          fileName: uploads.map((u) => u.fileName).join(", "),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      return res.status(200).json({ success: true, uploads: uploads });
    });
  }
};

export default withAuth(handler);
