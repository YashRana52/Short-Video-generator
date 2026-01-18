import React, { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import { Loader2, RectangleVerticalIcon, Wand2Icon } from "lucide-react";
import { PrimaryButton } from "../components/Buttons";

function Generator() {
  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "product") setProductImage(e.target.files[0]);
      else setModelImage(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your model and product images to generate stunning UGC, short-form videos and social media post"
        />

        <div className="flex gap-20 max-sm:flex-col items-start justify-between ">
          {/* left col */}
          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone
              label="Product Image"
              file={productImage}
              onClear={() => setProductImage(null)}
              onChange={(e) => handleFileChange(e, "product")}
            />
            <UploadZone
              label="Model Image"
              file={modelImage}
              onClear={() => setModelImage(null)}
              onChange={(e) => handleFileChange(e, "model")}
            />
          </div>

          {/* right col */}

          <div className="w-full ">
            <div className="mb-4 text-gray-300">
              <label htmlFor="name" className="block text-sm mb-4">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name Your Project"
                required
                className="w-full bg-white/3 p-4 rounded-lg border-2 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="product" className="block text-sm mb-4">
                Product Name
              </label>
              <input
                type="text"
                id="product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter the nameof product"
                required
                className="w-full bg-white/3 p-4 rounded-lg border-2 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm mb-4">
                Product Description{" "}
                <span className="text-xs text-violet-500">(optional)</span>
              </label>
              <textarea
                id="description"
                value={productDescription}
                rows={4}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter the description of product"
                className="w-full bg-white/3 p-4 rounded-lg border-2 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>
            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Aspect Ratio</label>
              <div className="flex gap-3">
                <RectangleVerticalIcon
                  onClick={() => setAspectRatio("9:16")}
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />
                <RectangleVerticalIcon
                  onClick={() => setAspectRatio("16:9")}
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />
              </div>

              <div className="mt-4 text-gray-300">
                <label htmlFor="prompt" className="block text-sm mb-4">
                  User Prompt{" "}
                  <span className="text-xs text-violet-500">(optional)</span>
                </label>
                <textarea
                  id="prompt"
                  value={userPrompt}
                  rows={4}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Describe how you want the narration to be."
                  className="w-full bg-white/3 p-4 rounded-lg border-2 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <PrimaryButton
            disabled={isGenerating}
            className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Generating...
              </>
            ) : (
              <>
                <Wand2Icon className="size-5" /> Generate Image
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

export default Generator;
