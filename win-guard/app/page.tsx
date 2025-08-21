export default function LandingPage() {
  return (
    <section className="max-w-3xl mx-auto text-center py-16 space-y-6">
      <h1 className="text-3xl md:text-5xl font-extrabold">Win Guard</h1>
      <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
        اپ مینیمال برای شروع سریع با Next.js 14، Tailwind و Supabase.
      </p>
      <div className="flex items-center justify-center gap-3">
        <a href="/auth/signup" className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm">
          ثبت‌نام
        </a>
        <a href="/auth/login" className="px-4 py-2 rounded-md border text-sm">
          ورود
        </a>
      </div>
    </section>
  );
}
