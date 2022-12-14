import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  try {
    const uid = req.body.uid;
    console.log("req.admin", req.admin);
    if (req.admin) adminAuth.setCustomUserClaims(uid, { admin: true });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error });
  }
};

export default withAuth(handler);
