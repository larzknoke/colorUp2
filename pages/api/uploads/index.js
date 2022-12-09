import { withAuth } from "../../../lib/middlewares";
import { firestore } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  try {
    const snapshot =
      req.admin && req.query.admin
        ? await firestore.collection("uploads").get()
        : await firestore
            .collection("uploads")
            .where("userID", "==", req.uid)
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
};

export default withAuth(handler);
