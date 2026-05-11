import type { ReactNode } from "react";

export interface CacheInspectorProps {
  /** Optional className for styling */
  className?: string;
}

/**
 * Cache Inspector DevTools component.
 * 
 * Renders a floating button in the bottom-right corner of the screen.
 * Click it to see cache analysis for your Next.js app.
 * 
 * @example
 * ```tsx
 * import { CacheInspector } from "next-cache-inspector/devtools";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         {process.env.NODE_ENV === "development" && <CacheInspector />}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function CacheInspector(props?: CacheInspectorProps): ReactNode;
