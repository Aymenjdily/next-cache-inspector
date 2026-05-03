import { Suspense } from "react";

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return [{ slug: "alpha" }];
}

export default async function ProductPage(): Promise<React.JSX.Element> {
  await fetch("https://example.com/api/product", {
    next: {
      revalidate: false,
      tags: ["product"],
    },
  });

  return (
    <Suspense fallback={null}>
      <main>product</main>
    </Suspense>
  );
}
