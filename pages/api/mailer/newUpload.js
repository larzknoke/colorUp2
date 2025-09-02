import sendgrid from "@sendgrid/mail";
import { sendEmail } from "../../../lib/email";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function newUpload(req, res) {
  try {
    console.log("Mailer REQ.BODY", req.body);
    await sendEmail({
      to: process.env.MAILTO,
      // from: "vorstufe@colorplus.de",
      subject: `${req.body.subject}`,
      html: `<div>
            <p><strong>Neuer Upload:</strong></p>
            <table>
                <tr>
                    <td></td>
                </tr>
            </table>
            <p>Email: ${req.body.userEmail}</p>
            <p>Auftrag: ${req.body.orderId}</p>
            <p>Notiz: ${req.body.note}</p>
            <p>Dateien: ${req.body.fileName}</p>
        </div>`,
    });
  } catch (error) {
    console.log("mail error: ", error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ error: "" });
}

export default newUpload;
