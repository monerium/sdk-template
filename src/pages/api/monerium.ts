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

  //   const ctx = await client.getAuthContext();
  //   const user = await client.getProfile(profileId);

  //   console.log('AuthContext', ctx);
  //   console.log('User', user)

  //   console.log("aha", ctx, profile, user);

  res.redirect("/");
  //   res.status(200).end();

  //   const queryParams = req.query;
  //   if (queryParams?.code && queryParams?.state) {
  //     let params = JSON.parse(
  //       cookies?.get(queryParams.state as string) as string
  //     );
  //     const authorizationCode = queryParams?.code as string;

  //     const headers = new Headers();
  //     headers.append("content-type", "application/x-www-form-urlencoded"); // Required

  //     if (authorizationCode && params && params?.client_id) {
  //       await fetch("https://api.monerium.dev/auth/token", {
  //         method: "POST",
  //         body: new URLSearchParams({
  //           client_id: params.client_id,
  //           code: authorizationCode,
  //           redirect_uri: params.redirect_uri,
  //           grant_type: "authorization_code",
  //           code_verifier: params.code_verifier,
  //         }),
  //         headers: headers,
  //       }).then(async (data) => {
  //         const response = await data.json();
  //         const { access_token, profile, userId, refresh_token } = response;

  //         // You should securely store the access_token and the refresh_token
  //         // This is not secure, it exposes the access_token to the client:
  //         cookies.set(profile, JSON.stringify(response));

  //         res.redirect(`/user/${profile}`);
  //       });
  //     }
  //   } else {
  //     res.status(400).end();
  //   }
}
