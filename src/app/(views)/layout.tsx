import { getAvailableGraph } from "@/app/_lib/graphState";
import GraphHydrator from "@/app/_components/GraphHydrator";
import InspectorShell from "@/app/_components/InspectorShell";

export default async function ViewsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const initialGraph = await getAvailableGraph();

  return (
    <>
      <GraphHydrator initialGraph={initialGraph} />
      <InspectorShell>{children}</InspectorShell>
    </>
  );
}
