import sendgrid from "@sendgrid/mail";
import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";
import userPasswortTemplate from "./templates/userPasswortResetTemplate";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function userReset(req, res) {
  try {
    console.log("Mailer REQ.BODY", req.body);
    const userRes = await adminAuth.listUsers();
    userRes.users.map((user) => {
      adminAuth
        .generatePasswordResetLink(user.email, {
          url: process.env.NEXT_PUBLIC_BASE_URL,
        })
        .then(async (link) => {
          try {
            const html = userPasswortTemplate(link);
            await sendgrid.send({
              to: user.email,
              from: "vorstufe@colorplus.de",
              subject: "Umstellung | Neues Passwort | COLOR+ Upload",
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
    });
  } catch (error) {
    console.log("mail error: ", error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

export default withAuth(userReset);
