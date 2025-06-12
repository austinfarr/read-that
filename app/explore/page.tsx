import { getExploreBooks } from "@/lib/hardcover-api";
import ExploreClientPage from "./ExploreClientPage";

export default async function ExplorePage() {
  // Fetch books from Hardcover API (with fallback data)
  const books = await getExploreBooks();

  return <ExploreClientPage books={books} />;
}
