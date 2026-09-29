import { adminAuth } from "../../../lib/firebase-admin";
import { sendEmail } from "../../../lib/email";

export default async (req, res) => {
  try {
    const uid = req.body.uid;
    const user = await adminAuth.getUser(uid);
    console.log("user backend: ", user);
    if (user.email == "info@larsknoke.com") {
      adminAuth.setCustomUserClaims(uid, { admin: true });
    } else {
      adminAuth.setCustomUserClaims(uid, { admin: false });
    }
    await sendEmail({
      to: process.env.MAILTO,
      subject: "Neue Registrierung | COLOR+ Upload",
      html: `<div>
            <p><strong>Ein neuer Benutzer hat sich registriert:</strong></p>
            <p>${JSON.stringify(user)}</p>
        </div>`,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ error });
  }
};
