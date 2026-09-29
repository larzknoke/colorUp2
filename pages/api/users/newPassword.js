import { adminAuth } from "../../../lib/firebase-admin";
import { sendEmail } from "../../../lib/email";
import validateEmail from "../../../utils/email-checker";
import newPasswordTemplate from "../mailer/templates/newPasswortTemplate";

export default async (req, res) => {
  try {
    const userEmail = req.body.emailForPassword;
    if (!validateEmail(userEmail) || userEmail == "")
      return res.status(500).json({ error: "Bitte gültige Email eingeben." });

    const link = await adminAuth.generatePasswordResetLink(userEmail, {
      url: process.env.NEXT_PUBLIC_BASE_URL,
    });

    console.log("Mailer REQ.BODY", req.body);
    await sendEmail({
      to: userEmail,
      subject: "Neues Passwort | COLOR+ Upload",
      html: newPasswordTemplate(link),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log("newPasswordError: ", error);
    return res
      .status(error.statusCode || 500)
      .json({ error: error.message });
  }
};
