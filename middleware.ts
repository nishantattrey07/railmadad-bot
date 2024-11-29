import { auth } from '@/lib/auth';

const protectedRoutes = ['/admin'];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = protectedRoutes.includes(req.nextUrl.pathname);

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
