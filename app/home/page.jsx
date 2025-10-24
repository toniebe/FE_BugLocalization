// app/home/page.jsx  -- SERVER COMPONENT
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SearchClient from "./SearchClient";

export default async function Page() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value; 
  if (!idToken) redirect("/login?next=/home");

  return <SearchClient />;
}
