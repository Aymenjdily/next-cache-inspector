export const revalidate = 600;

export default async function BlogPage(): Promise<React.JSX.Element> {
  await fetch("https://example.com/api/posts", {
    next: {
      revalidate: 600,
      tags: ["posts"],
    },
  });

  await fetch("https://example.com/api/untagged", {
    next: {
      revalidate: 600,
    },
  });

  return <main>blog</main>;
}
