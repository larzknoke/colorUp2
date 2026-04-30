import { firestore, bucket } from "../../../lib/firebase-admin";
import { withAuth } from "../../../lib/middlewares";
import initAuth from "../../../lib/initAuth";
import { deleteUploadFile } from "../../../lib/local-upload-storage";

initAuth();

const FOUR_WEEKS_MS = 28 * 24 * 60 * 60 * 1000;

const handler = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!req.admin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const cutoff = Date.now() - FOUR_WEEKS_MS;

    const snapshot = await firestore
      .collection("uploads")
      .where("createdAt", "<", cutoff)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, deleted: 0 });
    }

    const results = await Promise.allSettled(
      snapshot.docs.map(async (doc) => {
        const { filePath } = doc.data();

        // Delete from local filesystem (new uploads)
        await deleteUploadFile(filePath).catch(() => {});

        // Delete from Firebase Storage (old uploads)
        await bucket
          .file(filePath)
          .delete()
          .catch(() => {});

        await doc.ref.delete();
        return doc.id;
      }),
    );

    const deleted = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.status(200).json({ success: true, deleted, failed });
  } catch (error) {
    console.error("cleanup error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAuth(handler);
