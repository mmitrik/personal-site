import './globals.css';

export const metadata = {
  title: "Matt Mitrik",
  description: "Product & Technical Program Manager | Builder | Leader",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Poppins:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-bg text-text leading-relaxed antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
