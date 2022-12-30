import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function newUpload(req, res) {
  try {
    console.log("Mailer REQ.BODY", req.body);
    await sendgrid.send({
      to: process.env.MAILTO, // Your email where you'll receive emails
      from: "vorstufe@colorplus.de", // your website email address here
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
