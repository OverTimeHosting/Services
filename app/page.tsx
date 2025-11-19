"use client";

import { Suspense } from 'react';
import TemplateGrid from "@/components/TemplateGrid";
import Navigation from "@/components/Navigation";
import Search from "@/components/Search";
import { useStore } from "@/store";

export default function Home() {
  const view = useStore((state) => state.view);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Suspense fallback={<div className="mx-auto p-4 lg:p-12 border-b w-full">Loading...</div>}>
        <Search />
      </Suspense>
      <TemplateGrid view={view} />
    </div>
  );
}
