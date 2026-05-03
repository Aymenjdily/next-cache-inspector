export const dynamic = "force-dynamic";
export const revalidate = 120;

export default async function DynamicPage(): Promise<React.JSX.Element> {
  await fetch("https://example.com/api/dynamic", {
    cache: "no-store",
    next: {
      revalidate: 120,
      tags: ["dynamic"],
    },
  });

  return <main>dynamic</main>;
}
