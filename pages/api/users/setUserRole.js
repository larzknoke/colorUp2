import { adminAuth } from "../../../lib/firebase-admin";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
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
    await sendgrid.send({
      to: process.env.MAILTO,
      from: "vorstufe@colorplus.de",
      subject: "Neue Registrierung | COLOR+ Upload",
      html: `<div>
            <p><strong>Ein neuer Benutzer hat sich registriert:</strong></p>
            <p>${JSON.stringify(user)}</p>
        </div>`,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error });
  }
};
