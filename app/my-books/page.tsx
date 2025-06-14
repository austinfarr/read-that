import { BookOpen } from 'lucide-react';

export default function MyBooksPage() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">My Books</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Your book collection will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}