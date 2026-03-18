import "./coming-soon.css";

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="coming-soon-layout">
      {children}
    </div>
  );
}
