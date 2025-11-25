
import { redirect } from "next/navigation";
import NewBugPage from "./AddBug";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const idToken = (await cookieStore).get("id_token")?.value;

  if (!idToken) {
    redirect("/login?next=/home");
  }
  return <NewBugPage />;
}
