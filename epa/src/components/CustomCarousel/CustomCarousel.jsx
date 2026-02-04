import { useState } from "react";
import VoicePlayer from "../VoicePlayer/VoicePlayer";

export default function CustomCarousel({ items }) {
    const [index, setIndex] = useState(0);

    return (
        <div className="w-full">

            {/* Carousel Box */}
            <div className="relative w-full h-64 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div
                    className="flex h-full transition-transform duration-500"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {items.map((media, i) => (
                        <div key={i} className="w-full h-full flex-shrink-0">
                            {media.type === "image" && (
                                <img src={media.src} className="w-full h-full object-cover" />
                            )}

                            {media.type === "video" && (
                                <video
                                    src={media.src}
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {media.type === "voice" && (
                                <div className="w-full h-full flex items-center justify-center">
                                    <VoicePlayer src={media.src} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots BELOW the container */}
        <div className="w-full flex justify-center items-center gap-2 mt-4">
  {items.map((_, i) => (
    <button
      key={i}
      onClick={() => setIndex(i)}
      className={`
        transition-all rounded-full
        ${index === i
          ? "w-8 h-[6px] bg-[#1A8F3F]"   /* active: long pill */
          : "w-4 h-[6px] bg-gray-300"    /* inactive: shorter pill */
        }
      `}
    />
  ))}
</div>



        </div>
    );
}
