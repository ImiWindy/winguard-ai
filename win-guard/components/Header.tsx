// components/Header.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const Header = async () => {
  const supabase = getSupabaseServerClient();
  const userResp = supabase ? await supabase.auth.getUser() : { data: { user: null } } as any;
  const user = userResp?.data?.user ?? null;

  const handleLogout = async () => {
    "use server";
    const supabase = getSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    return redirect("/auth/login");
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* بخش برند */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              Win Guard
            </Link>
          </div>

          {/* لینک‌های دسکتاپ */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  داشبورد
                </Link>
                <Link href="/trades" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  معاملات
                </Link>
                <Link href="/trades/add" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                  افزودن معامله
                </Link>
              </>
            )}
          </div>

          {/* دکمه ورود/خروج */}
          <div className="flex items-center">
            {user ? (
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  خروج
                </button>
              </form>
            ) : (
              <Link
                href="/auth/login"
                className="bg-gray-700 text-white hover:bg-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                ورود
              </Link>
            )}
          </div>
        </div>

        {/* لینک‌های موبایل */}
        {user && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2">
            <div className="flex flex-col space-y-1">
              <Link href="/dashboard" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md">
                داشبورد
              </Link>
              <Link href="/trades" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md">
                معاملات
              </Link>
               <Link href="/trades/add" className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md">
                  افزودن معامله
                </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
