const FounderSection = () => {
  return (
    <section className="w-full bg-[#061b3b] py-12 px-3 sm:px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <p
            className="text-amber-400 uppercase tracking-[0.3em]
            text-sm font-bold mb-2"
          >
            Meet Our Founder
          </p>

          <h2
            className="text-white text-4xl sm:text-5xl
            font-black tracking-wide"
          >
            FOUNDER
          </h2>

          <div className="w-24 h-1 bg-amber-400 mx-auto mt-4" />
        </div>

        {/* Original Founder Poster */}
        <div
          className="w-full overflow-hidden
          border-2 border-amber-400 shadow-2xl"
        >
          <img
            src="/images/founder-manoj-k.jpg"
            alt="Manoj K - Founder of Game Square Chess"
            className="block w-85 h-auto"
          />
        </div>
      </div>
      <div className="text-center mt-10">
        <p
          className="text-amber-400 uppercase tracking-[0.3em]
    text-sm font-bold mb-2"
        >
          Our Team
        </p>
        <h2
          className="text-white text-4xl sm:text-5xl
            font-black tracking-wide"
        >
          ACADEMY OFFICIALS
        </h2>

        <div className="w-24 h-1 bg-amber-400 mx-auto mt-4" />
      </div>

      {/* Centered Poster */}
      <div
        className="w-full max-w-2xl mx-auto mt-8
  border-2 border-amber-400 shadow-2xl overflow-hidden"
      >
        <img
          className="block w-full h-50"
          src="/images/santhosh-r.jpeg"
          alt="Academy Director"
        />
      </div>
    </section>
  );
};
export default FounderSection;
