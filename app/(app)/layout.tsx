import { requireUser } from "@/lib/auth";
import TopNavBar from "@/components/TopNavBar";
import BottomNavBar from "@/components/BottomNavBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      <TopNavBar />
      <div className="relative z-10 min-h-screen pt-24 pb-28 md:pb-12">{children}</div>
      <BottomNavBar />
    </>
  );
}
