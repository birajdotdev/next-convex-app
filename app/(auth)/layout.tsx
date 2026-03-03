export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <div className="flex w-full min-h-screen">{children}</div>;
}
