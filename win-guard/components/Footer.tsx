// components/Footer.tsx

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-5xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {currentYear} Win Guard. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
