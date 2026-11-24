import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const mentors = [
  {
    id: 1,
    name: "Manoaj K",
    image: "/images/manoj-k-poster.png",
    alt: "Manoaj K - Chess Coach and Tournament Organizer",
  },

  // Add more coach posters here later
];

const MentorshipSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? mentors.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === mentors.length - 1 ? 0 : prev + 1));
  };

  // Close popup using Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <section className="w-full py-12 px-4 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-3">
            Meet Our Team
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            Our <span className="text-amber-400">Chess Coaches</span>
          </h2>

          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Meet the mentors behind Game Square Chess and explore their
            achievements and contributions.
          </p>
        </div>

        {/* Compact Poster Box */}
        <div className="relative flex items-center justify-center">
          {mentors.length > 1 && (
            <button
              onClick={prevSlide}
              aria-label="Previous coach"
              className="absolute left-0 md:left-2 z-10
              w-10 h-10 md:w-12 md:h-12 rounded-full
              bg-slate-900 border border-amber-400/50
              text-amber-400 flex items-center justify-center
              hover:bg-amber-400 hover:text-slate-950
              transition-all shadow-lg"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Clickable Poster */}
          <button
            type="button"
            onClick={() => setIsPopupOpen(true)}
            aria-label={`View full poster of ${mentors[currentSlide].name}`}
            className="group relative w-full max-w-[280px] sm:max-w-[320px]
            h-[340px] sm:h-[380px] p-2 rounded-2xl
            bg-gradient-to-br from-amber-300 via-yellow-600 to-amber-800
            shadow-[0_15px_45px_rgba(0,0,0,0.45)]
            hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900">
              <img
                key={mentors[currentSlide].id}
                src={mentors[currentSlide].image}
                alt={mentors[currentSlide].alt}
                className="w-full h-full object-contain"
              />

              <div
                className="absolute inset-x-0 bottom-0 py-4
              bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent
              flex items-center justify-center gap-2
              text-white text-sm font-bold"
              ></div>
            </div>
          </button>

          {mentors.length > 1 && (
            <button
              onClick={nextSlide}
              aria-label="Next coach"
              className="absolute right-0 md:right-2 z-10
              w-10 h-10 md:w-12 md:h-12 rounded-full
              bg-slate-900 border border-amber-400/50
              text-amber-400 flex items-center justify-center
              hover:bg-amber-400 hover:text-slate-950
              transition-all shadow-lg"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Slider Dots */}
        {mentors.length > 1 && (
          <div className="flex justify-center gap-3 mt-6">
            {mentors.map((mentor, index) => (
              <button
                key={mentor.id}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to ${mentor.name}`}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-8 bg-amber-400"
                    : "w-2.5 bg-slate-600 hover:bg-amber-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* FULL POSTER POPUP */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90
          backdrop-blur-sm flex items-center justify-center
          p-3 sm:p-6"
          onClick={() => setIsPopupOpen(false)}
        >
          {/* Full Poster - Clicking poster will NOT close popup */}
          <div
            className="w-full max-w-2xl max-h-[92vh]
            flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={mentors[currentSlide].image}
              alt={mentors[currentSlide].alt}
              className="max-w-full max-h-[88vh] w-auto h-auto
              object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default MentorshipSlider;
