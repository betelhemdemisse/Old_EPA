import { useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function VoicePlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  // Expanded array to create a denser look and fill the space
  // Values near 10-20 create the "dot" effect at the ends
  const waveformHeights = [
    15, 20, 30, 15, 40, 60, 80, 50, 70, 40, 
    20, 60, 90, 60, 40, 80, 50, 30, 50, 70, 
    40, 20, 30, 60, 40, 20, 15, 10
  ];

  return (
    <div className="flex items-center justify-center p-4">
      {/* Container: Changed w-80 to w-fit so elements stay close together */}
      <div className="flex items-center gap-4 bg-[#F0F2F5] pl-3 pr-4 py-3 rounded-full w-fit shadow-sm">
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full bg-[#348458] hover:opacity-90 transition-opacity"
        >
          {isPlaying ? (
            <Pause className="text-white fill-current" size={18} />
          ) : (
            <Play className="text-white fill-current ml-1" size={18} />
          )}
        </button>

        {/* Visual Waveform */}
        {/* Removed flex-1, added mx-1 for tight spacing */}
        <div className="flex items-center gap-[3px] h-8 mx-1">
          {waveformHeights.map((height, index) => (
            <div
              key={index}
              className={`w-[2px] rounded-full ${
                // Logic: played bars are darker, unplayed are lighter
                isPlaying && index < waveformHeights.length / 2 
                  ? "bg-gray-600" 
                  : "bg-gray-400"
              }`}
              style={{ height: `${height}%` }}
            ></div>
          ))}
        </div>

        {/* Time and Volume Icon */}
        <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
          <span className="font-normal text-xs">0:05</span>
        </div>
          <Volume2 size={18} className="text-gray-400" />

        {/* Hidden Audio */}
        <audio ref={audioRef} src={src} onEnded={handleEnded} className="hidden" />
      </div>
    </div>
  );
}