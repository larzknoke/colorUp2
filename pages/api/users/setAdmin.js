import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!req.admin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const uid = req.body.uid;
    if (!uid) {
      return res.status(400).json({ error: "User ID fehlt." });
    }

    await adminAuth.setCustomUserClaims(uid, { admin: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error });
  }
};

export default withAuth(handler);
