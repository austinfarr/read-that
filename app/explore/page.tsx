import { getExploreLists } from "@/lib/hardcover-api";
import ExploreClientPage from "./ExploreClientPage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage() {
  // Fetch curated lists from Hardcover API
  const exploreLists = await getExploreLists();

  return <ExploreClientPage exploreLists={exploreLists} />;
}
