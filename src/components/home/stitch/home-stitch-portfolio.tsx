import { StitchPortfolioTile } from "@/components/agency/stitch-portfolio-tile";
import { portfolioStory, portfolioTiles } from "@/config/portfolio";

export function HomeStitchPortfolio() {
  return (
    <section className="bg-[#0e0e0e] py-28 md:py-36">
      <div className="mx-auto mb-16 max-w-7xl px-6 sm:mb-20 sm:px-10">
        <h2 className="font-stitch-display text-5xl font-bold uppercase text-white md:text-7xl">
          {portfolioStory.homeSectionTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-sm uppercase tracking-widest text-stitch-muted">
          {portfolioStory.homeSectionSubtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-px px-6 sm:px-10 md:grid-cols-12">
        {portfolioTiles.map((tile) => (
          <StitchPortfolioTile key={tile.id} {...tile} />
        ))}
      </div>
    </section>
  );
}
