export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  await fetch("https://example.com/api/posts", {
    cache: "force-cache",
    next: {
      revalidate: 600,
      tags: ["posts"],
    },
  });

  return <section>{children}</section>;
}
