import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Hero from "./_components/Hero";

export default function HomePage() {
  return (
    <section>
      <Hero/>
    </section>
  );
}
