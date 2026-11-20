import { withAuth } from "../../../lib/middlewares";
import { firestore, adminAuth } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  if (!req.admin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const users = await adminAuth.listUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAuth(handler);
