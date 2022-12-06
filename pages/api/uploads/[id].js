import { withAuth } from "../../../lib/middlewares";
import { firestore } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  try {
    const id = req.query.id;
    const filePath = (
      await firestore.collection("uploads").doc(id).get()
    ).data().filePath;
    await firestore.collection("uploads").doc(id).delete();
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default withAuth(handler);
