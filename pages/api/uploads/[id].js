import { withAuth } from "../../../lib/middlewares";
import { firestore, storage, bucket } from "../../../lib/firebase-admin";

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
};

export default withAuth(handler);
