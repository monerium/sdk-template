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
  console.log(
    "||||",
    "color:white; padding: 30px; background-color: darkgreen",
    codeVerifier,
    "||||"
  );

  const client = new MoneriumClient();

  console.log("middleware codeVerifier", codeVerifier);
  console.log("middleware queryParams", queryParams);

  await client.auth({
    client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d",
    redirect_uri: "http://localhost:3000/api/monerium",
    code_verifier: codeVerifier,
    code: queryParams?.code as string,
  });

  const {
    access_token,
    expires_in,
    profile: profileId,
    userId,
    refresh_token,
  } = client.bearerProfile;

  cookies.set("refreshToken", refresh_token);

  res.redirect("/");
}
