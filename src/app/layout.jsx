import "./globals.css";

export const metadata = {
  title: {
    default: "NovaCart",
    template: "%s | NovaCart",
  },
  description: "NovaCart e-commerce — modern foundation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
