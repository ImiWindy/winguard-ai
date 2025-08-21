export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-8">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
        © {new Date().getFullYear()} Win Guard
      </div>
    </footer>
  );
}

