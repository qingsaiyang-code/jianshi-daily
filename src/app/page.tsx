import { KnowledgeApp } from "@/components/knowledge-app";
import { listKnowledge } from "@/server/knowledge-repository";
import { Suspense } from "react";

export default function HomePage() {
  return <Suspense fallback={<main className="loading-page">正在打开今日见识…</main>}><KnowledgeApp cards={listKnowledge()} /></Suspense>;
}
