"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  name?: string;
};

async function fileToProfileImage(file: File): Promise<string> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = imageUrl;
    });

    const size = 512;
    const canvas = document.createElement("canvas");
    const scale = Math.max(size / image.width, size / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (size - width) / 2;
    const y = (size - height) / 2;

    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image");
    context.drawImage(image, x, y, width, height);

    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function ProfilePhotoInput({
  value,
  onChange,
  label = "Profile photo",
  name = "profile-photo",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose an image file.");
      return;
    }

    setStatus("Preparing photo...");
    try {
      onChange(await fileToProfileImage(file));
      setStatus("Photo ready.");
    } catch {
      setStatus("Could not use that photo.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-700 text-lg font-bold text-white">
            ?
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={fileInputRef}
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-100"
            >
              Choose photo
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setStatus("Photo removed.");
                }}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-200"
              >
                Remove
              </button>
            ) : null}
          </div>
          {status ? <p className="text-xs text-slate-400">{status}</p> : null}
        </div>
      </div>
    </div>
  );
}
