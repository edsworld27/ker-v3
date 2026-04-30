import InfoPage from "@/components/InfoPage";
import IngredientGrid from "@/components/IngredientGrid";

export const metadata = {
  title: "Ingredients — every element named, traced and explained | Luv & Ker",
  description:
    "Click into each Odo ingredient to see the farm it comes from, the benefits, and how it's processed. No fragrance loophole. No hidden chemicals.",
};

export default function Page() {
  return (
    <InfoPage
      contentKey="ingredients.hero"
      eyebrow="Ingredients"
      title="Every element has a name, a region, a story"
      intro="We don't hide behind ‘fragrance’. Tap any ingredient to see the co-operative that grows it, how it's processed, and why we use it."
    >
      <IngredientGrid />
      <p className="mt-10">
        We never use parabens, phthalates, sulphates (SLS / SLES), synthetic fragrance, triclosan, or hidden preservatives. What you
        see on the label is what is in the bar.
      </p>
    </InfoPage>
  );
}
