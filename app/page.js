import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col  ">
     <nav className="bg-white shadow-2xl flex w-full px-3 py-2 items-center justify-between">
        <Image
          src="/easyfix-logo.png"
          alt="EasyFix Logo"
          width={120}
          height={40}
          className="object-contain"
        />
        <div className="space-x-4">
          <a href="#" className="text-sm text-[#01559A] font-medium text-muted-foreground">
            Pricing
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-[#01559A]  bg-primary rounded-lg hover:bg-primary/90 transition"
          >
            About Us
          </a>
        </div>
        <div className="space-x-4">
          <a href="#" className="text-sm font-medium text-[#01559A] text-muted-foreground">
            Login
          </a>
          <a
            href="#"
            className="px-4 py-2 text-sm font-medium text-[#01559A] bg-primary rounded-lg hover:bg-primary/90 transition"
          >
            Sign Up
          </a>
        </div>
      </nav>
      <main className="w-full  flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl font-bold">Welcome to EasyFix</h1>
        <p className="text-lg text-muted-foreground">
          Your one-stop solution for all repair services. Fast, reliable, and
          affordable.
        </p>
        <a
          href="#"
          className="px-6 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition"
        >
          Get Started
        </a>
      </main>
    </div>
  );
}
