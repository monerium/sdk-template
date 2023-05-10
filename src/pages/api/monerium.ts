import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";
import { MoneriumClient } from "@monerium/sdk";
import { profile } from "console";
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

  console.log("middleware codeVerifier", codeVerifier);
  console.log("middleware queryParams", queryParams);

  await emi.auth({
    client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d",
    redirect_uri: "http://localhost:3000/api/monerium",
    code_verifier: codeVerifier as string,
    code: queryParams?.code as string,
  });

  cookies.set("refreshToken", emi.bearerProfile?.refresh_token);

  res.redirect("/");
}
