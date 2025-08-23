export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t dark:border-gray-800 py-6 text-center text-sm text-gray-500">
      © {year} Win Guard
    </footer>
  );
}



