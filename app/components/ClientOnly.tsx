import { useState, useEffect } from "react";

interface ClientOnlyProps {
  children: () => React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Utility component to only render its children on the client side.
 * Useful for components that depend on browser APIs or cause hydration mismatches.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return <>{children()}</>;
}
