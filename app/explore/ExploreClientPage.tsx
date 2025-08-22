"use client";
import { ExploreLists } from "@/lib/hardcover-api";
import React from "react";
import ScrollableBookSection from "@/components/ScrollableBookSection";
import { 
  Sparkles, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Award,
  Telescope,
  Zap,
  Users,
  Trophy,
  Heart
} from "lucide-react";

interface ExploreClientPageProps {
  exploreLists: ExploreLists;
}

// Map categories to icons
const getCategoryIcon = (listName: string) => {
  const name = listName.toLowerCase();
  
  if (name.includes('award') || name.includes('prize') || name.includes('hugo') || name.includes('pulitzer')) {
    return <Award className="w-5 h-5 text-yellow-500" />;
  }
  if (name.includes('sci-fi') || name.includes('science fiction') || name.includes('science')) {
    return <Telescope className="w-5 h-5 text-blue-500" />;
  }
  if (name.includes('fantasy')) {
    return <Sparkles className="w-5 h-5 text-purple-500" />;
  }
  if (name.includes('tiktok') || name.includes('trending')) {
    return <TrendingUp className="w-5 h-5 text-pink-500" />;
  }
  if (name.includes('times') || name.includes('npr') || name.includes('esquire')) {
    return <Star className="w-5 h-5 text-orange-500" />;
  }
  if (name.includes('creative') || name.includes('potential')) {
    return <Zap className="w-5 h-5 text-green-500" />;
  }
  
  return <BookOpen className="w-5 h-5 text-teal-500" />;
};

export default function ExploreClientPage({
  exploreLists,
}: ExploreClientPageProps) {
  const { lists } = exploreLists;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[50vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 dark:from-purple-500/10 dark:via-blue-500/10 dark:to-teal-500/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400 dark:bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-400 dark:bg-purple-400 rounded-full animate-pulse delay-300" />
          <div className="absolute top-40 left-1/3 w-1.5 h-1.5 bg-teal-400 dark:bg-teal-400 rounded-full animate-pulse delay-700" />
          <div className="absolute top-28 right-1/4 w-1 h-1 bg-yellow-400 dark:bg-yellow-400 rounded-full animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto pt-44 pb-12 px-4 relative">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-teal-500 dark:text-teal-400 mr-3 animate-pulse" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-teal-600 dark:from-white dark:via-blue-100 dark:to-teal-200 bg-clip-text text-transparent">
                Community Curated
              </h1>
              <Trophy className="w-8 h-8 text-purple-500 dark:text-purple-400 ml-3 animate-pulse" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 dark:from-teal-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Book Collections
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover expertly curated book lists from
              <span className="text-teal-600 dark:text-teal-300 font-medium">
                {" "}
                NPR, The New York Times, Esquire{" "}
              </span>
              and passionate readers in the Hardcover community
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                <span className="text-lg font-medium">{lists.length} Curated Lists</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
                <span className="text-lg font-medium">Community Loved</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-lg font-medium">Award Winners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16 mt-4">
        {lists.map((list) => (
          list.books && list.books.length > 0 && (
            <ScrollableBookSection
              key={list.id}
              title={list.name}
              books={list.books}
              icon={getCategoryIcon(list.name)}
              description={list.description}
            />
          )
        ))}

        {/* Footer CTA */}
        <div className="text-center py-16 mt-8">
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-2xl border border-border/20">
            <Users className="w-12 h-12 text-teal-500 dark:text-teal-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Powered by the Community
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              These collections are created and curated by 
              <span className="text-teal-600 dark:text-teal-300 font-medium">
                {" "}
                real readers, critics, and publications{" "}
              </span>
              who know great books. Each list tells a story and offers a unique journey through literature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}