import { withAuth } from "../../../lib/middlewares";
import { getFirestore } from "firebase-admin/firestore";
import initAuth from "../../../lib/initAuth";

initAuth();
const firestore = getFirestore();

const handler = async (req, res) => {
  try {
    const snapshot =
      req.admin && req.query.admin
        ? await firestore.collection("uploads").get()
        : await firestore
            .collection("uploads")
            .where("userID", "==", req.id)
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
