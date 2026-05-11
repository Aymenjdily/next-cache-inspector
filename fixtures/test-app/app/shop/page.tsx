import { unstable_cache } from "next/cache";

export default async function ShopPage(): Promise<React.JSX.Element> {
  const getData = unstable_cache(
    async () => {
      const res = await fetch("https://example.com/api/shop");
      return res.json();
    },
    ["shop-data"],
    { revalidate: 3600, tags: ["shop"] },
  );

  const data = await getData();

  return <main>{data.title}</main>;
}
