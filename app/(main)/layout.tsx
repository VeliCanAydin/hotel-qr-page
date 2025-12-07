import Header from "@/components/Header";
import FooterWrapper from "@/components/FooterWrapper";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <FooterWrapper />
    </div>
  );
}
