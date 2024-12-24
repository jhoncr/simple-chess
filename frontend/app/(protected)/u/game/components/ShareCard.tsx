"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
// import { Input } from "@/components/ui/input";

export function ShareCard({ sharebleLink }: { sharebleLink: string }) {
  async function copyToClipboard() {
    await navigator.clipboard.writeText(sharebleLink);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share this game to continue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <p className="break-all">{sharebleLink}</p>
        <Button onClick={copyToClipboard}>
          <Copy size={16} />
          Copy Link
        </Button>
      </CardContent>
    </Card>
  );
}