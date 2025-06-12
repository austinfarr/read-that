import { getExploreBooks } from "@/lib/hardcover-api";
import ExploreClientPage from "./ExploreClientPage";

export default async function ExplorePage() {
  // Fetch categorized books from Hardcover API
  const categorizedBooks = await getExploreBooks();

  return <ExploreClientPage categorizedBooks={categorizedBooks} />;
}
