"use client";
import { useAuth } from "@/lib/auth_handler";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Redirect } from "@/lib/utils";

export default function NeedLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authUser, loading } = useAuth();
  // const [toolbar, setToolBar] = useState(null as React.ReactNode);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPath =
    pathname + (searchParams ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    console.log("Loading Layout. User:", authUser);
  }, [authUser]);

  return (
    <div>
      {(loading && <div>Loading App...</div>) ||
        (authUser && <> {children} </>) || <Redirect to={currentPath} />}
    </div>
  );
}
