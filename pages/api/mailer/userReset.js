import { withAuth } from "../../../lib/middlewares";
import { adminAuth } from "../../../lib/firebase-admin";
import { sendEmail } from "../../../lib/email";
import userPasswortTemplate from "./templates/userPasswortResetTemplate";

async function userReset(req, res) {
  try {
    console.log("Mailer REQ.BODY", req.body);
    const userRes = await adminAuth.listUsers();

    await Promise.all(
      userRes.users.map(async (user) => {
        const link = await adminAuth.generatePasswordResetLink(user.email, {
          url: process.env.NEXT_PUBLIC_BASE_URL,
        });

        await sendEmail({
          to: user.email,
          subject: "Umstellung | Neues Passwort | COLOR+ Upload",
          html: userPasswortTemplate(link),
        });
      }),
    );
  } catch (error) {
    console.log("mail error: ", error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}

export default withAuth(userReset);
