export const revalidate = 300;

export default async function HomePage(): Promise<React.JSX.Element> {
  await fetch("https://example.com/api/home", {
    next: {
      revalidate: 300,
      tags: ["home"],
    },
  });

  return <main>home</main>;
}
