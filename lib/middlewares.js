import initAuth from "./initAuth";
import { getUserFromCookies } from "next-firebase-auth";

initAuth();

export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = await getUserFromCookies({
        req,
        includeToken: true,
      });
      console.log("user: ", user);
      if (!user || !user.id) return res.status(401).end("Not authenticated!");
      req.id = user.id;
      req.admin = user.claims.admin;
    } catch (error) {
      console.log("withAuth: ", error);
      const errorCode = error.errorInfo.code;
      error.status = 401;
      if (errorCode === "auth/internal-error") {
        error.status = 500;
      }
      //TODO handlle firebase admin errors in more detail
      return res.status(error.status).json({ error: errorCode });
    }

    return handler(req, res);
  };
}
