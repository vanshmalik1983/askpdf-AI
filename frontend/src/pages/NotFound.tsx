import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="container-page flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-paper-dim text-ink-soft">
          <FileQuestion size={24} />
        </div>
        <h1 className="font-display text-3xl font-medium text-ink">Page not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          This page doesn't exist — much like an answer your document doesn't contain.
        </p>
        <Link to="/" className="btn-primary mt-7">
          Back to home
        </Link>
      </main>
    </div>
  );
}
