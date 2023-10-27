import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import { MoneriumClient } from "@monerium/sdk";
import { AUTH_FLOW_CLIENT_ID, AUTH_FLOW_REDIRECT_URL } from "@/constants";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const queryParams = req.query;
  const cookies = new Cookies(req, res);

  const codeVerifier = cookies.get("codeVerifier");

  const emi = new MoneriumClient();

  await emi.auth({
    client_id: AUTH_FLOW_CLIENT_ID,
    redirect_uri: AUTH_FLOW_REDIRECT_URL,
    code_verifier: codeVerifier as string,
    code: queryParams?.code as string,
  });

  cookies.set("refreshToken", emi.bearerProfile?.refresh_token);

  res.redirect("/");
}
