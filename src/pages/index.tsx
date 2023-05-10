import Head from "next/head";
import Image from "next/image";
import { MoneriumClient, AuthContext, Profile, Account } from "@monerium/sdk";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";

import Cookies from "cookies";

const inter = Inter({ subsets: ["latin"] });

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const emi = new MoneriumClient();

  const cookies = new Cookies(req, res);

  /**
   * The url to the partner application onboarding flow.
   **/
  const authFlowUrl = await emi.getAuthFlowURI({
    client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d", // Your applications Authorization Code Flow 'client_id'
    redirect_uri: "http://localhost:3000/api/monerium",
  });

  /**
   * When the user is redirected back to our app, we are redirecting him http://localhost:3000/api/monerium
   * We will need the codeVerifier there and the `code` from the querym params to be authorized.
   **/
  cookies.set("codeVerifier", emi?.codeVerifier);

  const refreshToken = cookies.get("refreshToken");
  console.log("refreshToken", refreshToken);

  // Try to authorize via refresh token.
  await emi
    .auth({
      client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d",
      refresh_token: refreshToken as string,
    })
    .catch(() => console.error);

  // The authorized user.
  let authCtx = null;

  try {
    authCtx = await emi.getAuthContext();
  } catch (e) {
    console.error(e);
  }

  // The profile information about the authorized client visiting my app.
  let profile = null;
  if (authCtx?.defaultProfile) {
    try {
      profile = await emi.getProfile(authCtx?.defaultProfile);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Pass props to page.
   **/
  return {
    props: { authCtx: authCtx, authFlowUrl: authFlowUrl, profile: profile },
  };
};

export default function Home(props: {
  authCtx: AuthContext;
  authFlowUrl: string;
  profile: Profile;
}) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Hey there! {props?.authCtx?.name}</p>
          <p>Get started with the Monerium API</p>
        </div>
        {!props?.profile?.accounts ? (
          <button
            className={styles.button}
            type="button"
            onClick={() => router.push(`${props?.authFlowUrl}`)}
          >
            Monerium Authorize
          </button>
        ) : (
          <>
            {props?.profile?.accounts.map((a: Account) => {
              return <p key={a?.id}>{a?.iban}</p>;
            })}
          </>
        )}
      </main>
    </>
  );
}
