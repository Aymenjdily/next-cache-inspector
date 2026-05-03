export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  void fetch("https://example.com/api/posts", {
    cache: "force-cache",
    next: {
      revalidate: 60,
      tags: ["posts"],
    },
  });

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
