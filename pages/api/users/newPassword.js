import { adminAuth } from "../../../lib/firebase-admin";
import sendgrid from "@sendgrid/mail";
import validateEmail from "../../../utils/email-checker";
import newPasswordTemplate from "../mailer/templates/newPasswortTemplate";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    const userEmail = req.body.emailForPassword;
    if (!validateEmail(userEmail) || userEmail == "")
      return res.status(500).json({ error: "Bitte gültige Email eingeben." });
    adminAuth
      .generatePasswordResetLink(userEmail, {
        url: process.env.NEXT_PUBLIC_BASE_URL,
      })
      .then(async (link) => {
        try {
          console.log("Mailer REQ.BODY", req.body);
          const html = newPasswordTemplate(link);
          await sendgrid.send({
            to: req.body.emailForPassword,
            from: "vorstufe@colorplus.de",
            subject: "Neues Passwort | COLOR+ Upload",
            html: html,
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
