import { Header } from "@/components/header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
