import type React from "react";
import { HypeGenForm } from "@/components/hypegen/HypeGenForm";
import { Heading } from "@/once-ui/components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-full p-4 sm:p-8 md:p-12 pt-12 sm:pt-16">
      <Heading
        as="h1"
        variant="display-default-l"
        align="center"
        marginBottom="l"
      >
        HypeGen
      </Heading>
      <HypeGenForm />
    </main>
  );
}
