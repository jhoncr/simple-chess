"use client";
import { useAuth } from "@/lib/auth_handler";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Redirect } from "@/lib/utils";
import { LoadingAnimation } from "@/app/login/loading";

export default function NeedLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingAnimation text="Loading URL Params..." />}>
      <InnerNeedLoginLayout>{children}</InnerNeedLoginLayout>
    </Suspense>
  );
}

function InnerNeedLoginLayout({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath =
    pathname + (searchParams ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    console.log("Loading Layout. User:", authUser);
  }, [authUser]);

  return (
    <div>
      {(loading && <LoadingAnimation text="Checking Authentication..." />) ||
        (authUser && <> {children} </>) || <Redirect to={currentPath} />}
    </div>
  );
}
