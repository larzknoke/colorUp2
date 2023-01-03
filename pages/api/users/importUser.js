import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";

const handler = async (req, res) => {
  try {
    if (!req.admin) throw new Error("Not authenticated", 401);
    Object.values(req.body.users).map((user) => adminAuth.createUser(user));
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("serverError: ", error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAuth(handler);
