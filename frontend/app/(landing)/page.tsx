import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
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
            </div>
          </div>
        </section>

        {/* Company History */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="Simple Chesspx-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              How to start
            </h2>
            <div className="flex flex-col items-center justify-center gap-6">
              {[
                {
                  title: "Create a game",
                  description:
                    "Click on the 'Play' button in the navigation bar and create a new game.",
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
                <Card key={index} className="flex flex-col items-center mb-6">
                  <div className="grid grid-cols-2 gap-4 items-center p-4">
                    <div className="flex flex-col justify-center space-y-4">
                      <h3 className="text-2xl font-bold">{step.title}</h3>

                      <p>{step.description}</p>
                      <div />
                    </div>
                    <img
                      alt={step.title}
                      className="overflow-hidden rounded-xl object-cover object-center"
                      height="310"
                      src={step.image}
                      width="550"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Members */}
        {/* <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="Simple Chesspx-4 md:px-6">
            <h2 className="text-xl tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Made with{" "}
              <Heart size={24} className="inline-block text-red-500" /> by Jhon
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                {
                  name: "Jhon Cordeiro",
                  role: "build stuff",
                  image:
                    "https://pbs.twimg.com/profile_images/1499957658941476867/IkeXWjX0_400x400.jpg",
                  // "https://x.com/J3Cordeiro/profile_image?size=original",
                },
              ].map((member, index) => (
                <Link href="https://x.com/J3Cordeiro" key={index}>
                  <Card className="cursor-pointer">
                    <CardHeader className="flex flex-col items-center">
                      <img
                        alt={member.name}
                        className="aspect-square overflow-hidden rounded-full object-cover object-center"
                        height="200"
                        src={member.image}
                        width="200"
                      />
                      <CardTitle className="mt-4">{member.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}
