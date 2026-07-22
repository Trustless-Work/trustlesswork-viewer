import { Footer } from "@/components/shared/Footer";

export default function NetworkSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
