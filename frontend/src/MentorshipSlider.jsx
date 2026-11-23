const MentorshipSlider = () => {
  return (
    <section className="w-full py-10 px-4">
      <div className="max-w-[650px] mx-auto">
        <div className="text-center mb-12">
          <p
            className="text-amber-400 uppercase tracking-[0.3em]
            text-sm font-bold mb-4"
          >
            Meet Our Team
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
            Our <span className="text-amber-400">Chess Coaches</span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto">
            Meet the coaches behind Game Square Chess, their experience,
            achievements and contributions to chess.
          </p>
        </div>
        <img
          src="/images/manoj-k-poster.png"
          alt="Manoj K - Chess Coach and Tournament Organizer"
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
};

export default MentorshipSlider;
