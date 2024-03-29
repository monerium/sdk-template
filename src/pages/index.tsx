import Head from "next/head";
import Image from "next/image";
import { MoneriumClient, AuthContext, Profile, Account } from "@monerium/sdk";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetServerSideProps } from "next";

import Cookies from "cookies";
import { AUTH_FLOW_CLIENT_ID, AUTH_FLOW_REDIRECT_URL } from "@/constants";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const emi = new MoneriumClient();

  const cookies = new Cookies(req, res);

  const refreshToken = cookies.get("refreshToken");
  console.log("refreshToken", refreshToken);
  let authFlowUrl = null;
  let authCtx = null;
  let profile = null;

  if (!refreshToken) {
    console.log("No refresh token found");
    /**
     * The url to the partner application onboarding flow.
     **/
    authFlowUrl = await emi.getAuthFlowURI({
      client_id: AUTH_FLOW_CLIENT_ID, // Your applications Authorization Code Flow 'client_id'
      redirect_uri: AUTH_FLOW_REDIRECT_URL,
    });

    /**
     * When the user is redirected back to our app, we are redirecting him http://localhost:3000/api/monerium
     * We will need the codeVerifier there and the `code` from the querym params to be authorized.
     **/
    cookies.set("codeVerifier", emi?.codeVerifier);
  } else {
    // Try to authorize via refresh token.
    await emi
      .auth({
        client_id: AUTH_FLOW_CLIENT_ID,
        refresh_token: refreshToken as string,
      })
      .catch(() => console.error);

    // The authorization info about the client visiting my app.

    try {
      authCtx = await emi.getAuthContext();
      console.log(
        "%c authCtx",
        "color:white; padding: 30px; background-color: darkgreen",
        authCtx
      );
    } catch (e) {
      console.error(e);
    }

    // The profile information about the authorized client visiting my app.

    if (authCtx?.defaultProfile) {
      try {
        profile = await emi.getProfile(authCtx?.defaultProfile);
      } catch (e) {
        console.error(e);
      }
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
            {props?.profile?.accounts?.map((a: Account) => {
              return <p key={a?.id}>{a?.iban}</p>;
            })}
          </>
        )}
      </main>
    </>
  );
}
