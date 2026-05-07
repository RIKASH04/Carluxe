import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            maxAge: 60 * 60 * 24 * 7, // 7 days
                            path: "/",
                            sameSite: "lax",
                        });
                    });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // Auth-protected routes
    const protectedRoutes = ["/dashboard", "/tracking", "/admin"];
    const adminRoutes = ["/admin"];
    const authRoutes = ["/auth"];

    if (
        !user &&
        protectedRoutes.some((r) => pathname.startsWith(r)) &&
        !authRoutes.some((r) => pathname.startsWith(r))
    ) {
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    if (user) {
        const isAdmin = user.email === "resulthub001@gmail.com";
        if (authRoutes.some((r) => pathname.startsWith(r))) {
            url.pathname = isAdmin ? "/admin" : "/dashboard";
            return NextResponse.redirect(url);
        }
        if (
            adminRoutes.some((r) => pathname.startsWith(r)) &&
            !isAdmin
        ) {
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}
