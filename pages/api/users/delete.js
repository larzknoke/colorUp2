import { adminAuth, bucket, firestore } from "../../../lib/firebase-admin";
import {
  deleteUploadFile,
  deleteUserUploadDirectory,
} from "../../../lib/local-upload-storage";
import { withAuth } from "../../../lib/middlewares";

const handler = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!req.admin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const uid = req.body?.uid || req.query.uid;
  if (!uid) {
    return res.status(400).json({ error: "User ID fehlt." });
  }

  if (uid === req.userId) {
    return res
      .status(400)
      .json({ error: "Der angemeldete Admin kann sich nicht selbst löschen." });
  }

  try {
    const snapshot = await firestore
      .collection("uploads")
      .where("userID", "==", uid)
      .get();

    const uploadResults = await Promise.allSettled(
      snapshot.docs.map(async (doc) => {
        const { filePath } = doc.data();

        if (filePath) {
          await Promise.all([
            deleteUploadFile(filePath),
            bucket
              .file(filePath)
              .delete()
              .catch(() => {}),
          ]);
        }

        await doc.ref.delete();
      }),
    );

    await deleteUserUploadDirectory(uid);
    await adminAuth.deleteUser(uid);

    const failedUploads = uploadResults.filter(
      (result) => result.status === "rejected",
    ).length;

    return res.status(200).json({
      success: true,
      deletedUploads: snapshot.size - failedUploads,
      failedUploads,
    });
  } catch (error) {
    console.error("user delete error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default withAuth(handler);
