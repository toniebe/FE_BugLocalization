import LoginClient from "./LoginClient";
import React from "react";


export const dynamic = "force-dynamic";


export default function LoginPage({ searchParams }) {
  const nextUrl = (searchParams?.next) || "/home";
  return <LoginClient nextUrl={nextUrl} />;
}