"use client";

import TemplateGrid from "@/components/TemplateGrid";
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import { useStore } from "@/store";

export default function Home() {
  const view = useStore((state) => state.view);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Search />
      <TemplateGrid view={view} />
    </div>
  );
}
