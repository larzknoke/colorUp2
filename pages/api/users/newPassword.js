import { adminAuth } from "../../../lib/firebase-admin";
import sendgrid from "@sendgrid/mail";
import validateEmail from "../../../utils/email-checker";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    const userEmail = req.body.emailForPassword;
    if (!validateEmail(userEmail) || userEmail == "")
      return res.status(500).json({ error: "Bitte gültige Email eingeben." });
    adminAuth
      .generatePasswordResetLink(userEmail, { url: "http://localhost:3000" })
      .then(async (link) => {
        try {
          console.log("Mailer REQ.BODY", req.body);
          await sendgrid.send({
            to: req.body.emailForPassword,
            from: "vorstufe@colorplus.de",
            subject: "Neues Passwort | COLOR+ Upload",
            html: `<div>
            <p><strong>Sie haben ein neues Passwort für den Daten-Upload bei COLOR+ angefordert:</strong></p>
            <p>MIt dem folgendem Link können Sie das Passwort zurücksetzen:</p>
            <a href="${link}">${link}</a>
        </div>`,
          });
        } catch (error) {
          console.log("mail error: ", error);
          return res
            .status(error.statusCode || 500)
            .json({ error: error.message });
        }
      })
      .catch((error) => {
        console.log("newPasswordError: ", error);
        return res
          .status(error.statusCode || 500)
          .json({ error: error.message });
      });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error });
  }
};
