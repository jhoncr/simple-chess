import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-8 md:py-12 lg:py-16 xl:py-24">
          <div className="Simple Chesspx-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Simple Chess
                </h1>
                <p className="mx-auto max-w-[700px] md:text-xl">
                  A simple way to play chess online with your friends. Create a
                  game, share the link, and start playing.
                </p>
              </div>
              <Link
                href="/u"
                className="inline-flex h-16 mt-4 items-center justify-center rounded-md bg-secondary px-12 text-lg font-medium text-secondary-foreground shadow transition-colors hover:bg-secondary/90 hover:scale-105 active:scale-95"
              >
                <Play size={24} className="mr-2" />
                Play
              </Link>
            </div>
          </div>
        </section>

        {/* Company History */}
        <section className="w-full py-6 md:py-12 lg:py-16">
          <div className="px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              How to start
            </h2>
            <div className="flex flex-col items-center justify-center gap-6">
              {[
                {
                  title: "Create a game",
                  description:
                    "Click on the 'Play' button in the navigation bar and create a new game. You'll be asked to login if you haven't already.",
                  image: "/simple-chess.svg",
                },
                {
                  title: "Share the link",
                  description: "Copy the link and share it with your friend.",
                  image: "/simple-chess.svg",
                },
                {
                  title: "Start playing",
                  description:
                    "Wait for your friend to join and start playing.",
                  image: "/simple-chess.svg",
                },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="flex flex-col items-center w-full max-w-md md:max-w-lg lg:max-w-xl"
                >
                  <div className="flex items-center w-full p-4">
                    <div className="flex flex-col justify-left space-y-4">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p>{step.description}</p>
                      <div />
                    </div>
                    {/* <img
                      alt={step.title}
                      className="overflow-hidden rounded-xl object-cover object-center"
                      height="310"
                      src={step.image}
                      width="550"
                    /> */}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
