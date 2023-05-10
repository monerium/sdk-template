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

export default function Home(props: {
  ctx: AuthContext;
  url: string;
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
          <p>Hey there! {props?.ctx?.name}</p>
          <p>Get started with the Monerium API</p>
        </div>
        {!props?.profile ? (
          <div className={styles.center}>
            <button
              className={styles.button}
              type="button"
              onClick={() => router.push(`${props?.url}`)}
            >
              <Image
                className={styles.logo}
                src="https://monerium.app/icon.png"
                alt="Next.js Logo"
                width={400}
                height={400}
                priority
              />
            </button>
          </div>
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

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const server = new MoneriumClient();

  const cookies = new Cookies(req, res);

  const refreshToken = cookies.get("refreshToken");
  console.log("refreshToken", refreshToken);

  const url = await server.getAuthFlowURI({
    client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d",
    redirect_uri: "http://localhost:3000/api/monerium",
  });

  if (server?.codeVerifier) {
    cookies.set("codeVerifier", server?.codeVerifier);
  }

  await server
    .auth({
      client_id: "654c9c30-44d3-11ed-adac-b2efc0e6677d",
      refresh_token: refreshToken as string,
    })
    .catch(() => console.error);

  let ctx = null;
  try {
    ctx = await server.getAuthContext();
  } catch (error) {
    console.log(error);
  }

  let profile = null;
  try {
    if (ctx?.defaultProfile) {
      profile = await server.getProfile(ctx?.defaultProfile);
    }
  } catch (error) {
    console.log(error);
  }
  console.log("profile", profile);
  // Pass AuthContext to the page via props
  return { props: { ctx: ctx, url: url, profile: profile } };
};
