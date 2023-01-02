export default function newPasswordTemplate(link) {
  const newPasswordTemplate = `
<!DOCTYPE<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Neues Passwort | COLOR+ Upload</title>
    <style>
      html,
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #1a202c;
        color: #232323;
      }
    </style>
  </head>
  <body>
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      height="100%"
      width="100%"
      id="bodyTable"
    >
      <tr>
        <td align="center" valign="top">
          <table
            border="0"
            cellpadding="20"
            cellspacing="0"
            width="90%"
            id="emailContainer"
          >
            <tr>
              <td align="center" valign="top">
                <table
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                  width="100%"
                  id="emailHeader"
                >
                  <tr>
                    <td align="center" valign="top">
                      <img
                        src="${process.env.NEXT_PUBLIC_BASE_URL}/upPlus_logo.png"
                        width="180px"
                        style="margin-top: 50px"
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="left" valign="top">
                <table
                  border="0"
                  cellpadding="30"
                  cellspacing="0"
                  width="100%"
                  id="emailBody"
                >
                  <tr>
                    <td align="left" valign="top">
                      <div
                        style="
                          background-color: #a0aec0;
                          padding: 40px;
                          border-radius: 4px;
                        "
                      >
                        <p>
                          <strong
                            >Sie haben ein neues Passwort für den Daten-Upload
                            bei COLOR+ angefordert:</strong
                          >
                        </p>
                        <p>
                          Mit dem folgendem Link können Sie das Passwort
                          zurücksetzen:
                        </p>
                        <a href="${link}">${link}</a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" valign="top">
                <table
                  border="0"
                  cellpadding="20"
                  cellspacing="0"
                  width="100%"
                  id="emailFooter"
                >
                  <tr>
                    <td align="center" valign="top">
                      <div style="color: #4a5568">
                        COLOR+ Upload | Alle Rechte vorbehalten | 2023 <br />
                        <a
                          style="
                            color: #4a5568 !important;
                            margin-top: 10px;
                            display: block;
                          "
                          href="https://www.colorplus.de"
                          >https://www.colorplus.de</a
                        >
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  return newPasswordTemplate;
}
