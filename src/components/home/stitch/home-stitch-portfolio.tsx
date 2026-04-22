import { StitchPortfolioTile } from "@/components/agency/stitch-portfolio-tile";
import { portfolioStory, portfolioTiles } from "@/config/portfolio";

export function HomeStitchPortfolio() {
  return (
    <section className="bg-[#0e0e0e] py-20 md:py-28 lg:py-36">
      <div className="mx-auto mb-12 max-w-7xl min-w-0 px-4 sm:mb-16 sm:px-6 md:mb-20 md:px-10">
        <h2 className="font-stitch-display text-balance text-4xl font-bold uppercase text-white sm:text-5xl md:text-7xl">
          {portfolioStory.homeSectionTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-xs uppercase tracking-widest text-stitch-muted sm:text-sm">
          {portfolioStory.homeSectionSubtitle}
        </p>
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-px px-4 sm:px-6 md:grid-cols-12 md:px-10">
        {portfolioTiles.map((tile) => (
          <StitchPortfolioTile key={tile.id} {...tile} />
        ))}
      </div>
    </section>
  );
}
