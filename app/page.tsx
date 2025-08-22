import { redirect } from "next/navigation";

export default async function Home() {
  // Redirect all users to explore page
  redirect('/explore');
}