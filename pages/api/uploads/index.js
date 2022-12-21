import { withAuth } from "../../../lib/middlewares";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import initAuth from "../../../lib/initAuth";
import formidable from "formidable";
import { v4 as uuidv4, v6 as uuidv6 } from "uuid";
import { doc } from "firebase/firestore";

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

      filesArr.map(async (file) => {
        const fileName = file.originalFilename
          .toLowerCase()
          .split(" ")
          .join("-");
        await bucket
          .upload(file.filepath, {
            destination: `${req.userId}/${Date.now()}/${fileName}`,
          })
          .then(async (uploadRef) => {
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
            return res.status(200).json({ success: true, doc: docRef.id });
          })
          // .then(async (uploadRef) => {
          //   const signedUrl = await uploadRef[0].getSignedUrl({
          //     action: "read",
          //     expires: Date.now() + 3600 * 1000 * 24, // 24h
          //   });
          //   console.log("signedUrl: ", signedUrl);
          // })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ success: false });
          });
      });
    });
  }
};

export default withAuth(handler);
