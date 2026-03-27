"use client";

import Image from "next/image";

// Actual UNIPOD room photos extracted from the Capacity document
const PHOTOS = [
  { src: "/spaces/image1.jpeg",  alt: "Pitch Garage" },
  { src: "/spaces/image4.jpeg",  alt: "Maker Space" },
  { src: "/spaces/image5.jpeg",  alt: "Maker Space" },
  { src: "/spaces/image6.jpeg",  alt: "Co-working Space" },
  { src: "/spaces/image8.jpeg",  alt: "Prototyping Lab" },
  { src: "/spaces/image9.png",   alt: "Board Room" },
  { src: "/spaces/image11.jpeg", alt: "Small Board Room" },
  { src: "/spaces/image13.jpeg", alt: "Event Space" },
  { src: "/spaces/image14.jpeg", alt: "Event Space" },
  { src: "/spaces/image17.jpeg", alt: "Design Lab" },
  { src: "/spaces/image19.jpeg", alt: "AI & Robotics Lab" },
  { src: "/spaces/image20.jpeg", alt: "Design Studio" },
  { src: "/spaces/image22.jpeg", alt: "Design Studio" },
];

export default function PhotoStrip() {
  // Duplicate list for seamless infinite loop
  const doubled = [...PHOTOS, ...PHOTOS];

  return (
    <div className="relative w-full overflow-hidden mt-10">
      {/* Left + right edge fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-20 z-10 bg-gradient-to-r from-brand-950 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 z-10 bg-gradient-to-l from-brand-800 to-transparent" />

      {/* animate-scroll-x is defined in globals.css */}
      <div
        className="flex gap-3 animate-scroll-x"
        style={{ width: "max-content" }}
      >
        {doubled.map((photo, i) => (
          <div
            key={i}
            className="relative shrink-0 w-52 h-32 rounded-xl overflow-hidden border border-white/10"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="208px"
            />
            <div className="absolute inset-0 bg-brand-900/20" />
            <p className="absolute bottom-2 left-2 text-xs text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded-full">
              {photo.alt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
