
import NewBugPage from "./AddBug";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = cookies();
  const idToken = (await cookieStore).get("id_token")?.value;

  if (!idToken) {
    redirect("/login?next=/home");
  }
  return <NewBugPage />;
}
