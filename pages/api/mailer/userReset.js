import sendgrid from "@sendgrid/mail";
import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function userReset(req, res) {
  try {
    console.log("Mailer REQ.BODY", req.body);
    const userRes = await adminAuth.listUsers();
    userRes.users.map((user) => {
      adminAuth
        .generatePasswordResetLink(user.email, {
          url: `http://${req.headers.host}`,
        })
        .then(async (link) => {
          try {
            await sendgrid.send({
              to: user.email,
              from: "vorstufe@colorplus.de",
              subject: "Umstellung | Neues Passwort | COLOR+ Upload",
              html: `<div>
            <p><strong>Wir haben unser Upload-Tool neu aufgebaut. Aus Sicherheitsgründen muss deshalb für die vorhandenen Benutzer ein neues Passwort festgelegt werden.</strong></p>
            <p>Hier zu können Sie die "Passwort vergessen" Funktion im <a href="http://${req.headers.host}">Login-Bereich</a> verwenden oder folgenden Link:</p>
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
    });
  } catch (error) {
    console.log("mail error: ", error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

export default withAuth(userReset);
