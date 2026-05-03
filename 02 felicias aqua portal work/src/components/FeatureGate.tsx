"use client";

import { useEffect, useState } from "react";
import { isFeatureEnabled, onFlagsChange } from "@/lib/admin/featureFlags";
import { getSession, AUTH_EVENT } from "@/lib/auth";

interface Props {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ flag, children, fallback = null }: Props) {
  const [enabled, setEnabled] = useState(true); // SSR-safe: show by default until client hydrates

  useEffect(() => {
    function check() {
      const session = getSession();
      setEnabled(isFeatureEnabled(flag, session?.user.email));
    }
    check();
    const off1 = onFlagsChange(check);
    window.addEventListener(AUTH_EVENT, check);
    return () => { off1(); window.removeEventListener(AUTH_EVENT, check); };
  }, [flag]);

  return enabled ? <>{children}</> : <>{fallback}</>;
}
