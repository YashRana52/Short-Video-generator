import React, { useEffect, useState } from "react";
import { dummyGenerations } from "../assets/assets";
import type { Project } from "../types";
import { Loader2 } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";

function MyGenerations() {
  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGeneration = async () => {
    setTimeout(() => {
      setGenerations(dummyGenerations);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchGeneration();
  }, []);
  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin size-7 text-indigo-400" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28 ">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            My Generations
          </h1>
          <p className="text-gray-400">
            View and manage your AI-generated content
          </p>
        </header>

        {/* generation List */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map((gen) => (
            <ProjectCard
              key={gen.id}
              gen={gen}
              setGenerations={setGenerations}
            />
          ))}
        </div>

        {generations.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center bg-white/5 rounded-xl border border-white/10 py-16 px-6">
            <h3 className="text-xl font-medium mb-2">No generations yet</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Start creating stunning AI-generated product photos in just a few
              clicks.
            </p>

            <PrimaryButton onClick={() => (window.location.href = "/generate")}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGenerations;
