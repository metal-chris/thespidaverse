import "./splash.css";

export default function SplashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="splash-layout">
      {children}
    </div>
  );
}
