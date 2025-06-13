import { getExploreBooks } from "@/lib/hardcover-api";
import ExploreClientPage from "./ExploreClientPage";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExplorePage() {
  // Fetch categorized books from Hardcover API
  const categorizedBooks = await getExploreBooks();

  return <ExploreClientPage categorizedBooks={categorizedBooks} />;
}
