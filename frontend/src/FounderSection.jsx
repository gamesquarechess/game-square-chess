const FounderSection = () => {
  const officials = [
    {
      image: "/images/santhosh-r.jpeg",
      name: "Academy Director",
      alt: "Game Square Chess Academy Director",
    },
    {
      image: "/images/official-2.png",
      name: "Academy Official",
      alt: "Game Square Chess Academy Official",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-[#061b3b] py-16 px-4 sm:px-6">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* FOUNDER HEADING */}
        <div className="text-center mb-10">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-xs sm:text-sm font-bold mb-3">
            Meet Our Founder
          </p>

          <h2 className="text-white text-3xl sm:text-5xl font-black tracking-wide">
            FOUNDER
          </h2>

          <div className="w-20 h-1 bg-amber-400 mx-auto mt-4 rounded-full" />
        </div>

        {/* FOUNDER POSTER */}
        <div className="max-w-[1000px] mx-auto">
          <div className="p-1 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-xl">
            <div className="bg-[#0b2345] rounded-lg overflow-hidden">
              <img
                src="/images/founder-manoj-k.jpg"
                alt="Manoj K - Founder of Game Square Chess"
                className="block w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-400/60" />
          <span className="text-amber-400 text-2xl">♟</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-400/60" />
        </div>

        {/* ACADEMY OFFICIALS HEADING */}
        <div className="text-center mb-10">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-xs sm:text-sm font-bold mb-3">
            Meet Our Team
          </p>

          <h2 className="text-white text-3xl sm:text-5xl font-black tracking-wide">
            ACADEMY OFFICIALS
          </h2>

          <div className="w-20 h-1 bg-amber-400 mx-auto mt-4 rounded-full" />

          <p className="text-slate-400 text-sm mt-5 max-w-xl mx-auto">
            The people behind Game Square Chess and its journey.
          </p>
        </div>

        {/* OFFICIAL POSTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {officials.map((official, index) => (
            <div
              key={index}
              className="group rounded-xl p-1 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="bg-[#0b2345] rounded-lg overflow-hidden h-full">
                <img
                  src={official.image}
                  alt={official.alt}
                  className="block w-full h-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
