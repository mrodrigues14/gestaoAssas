import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Páginas que não precisam de autenticação
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

  // Verificar se tem token nos cookies
  const token = request.cookies.get('token')?.value;
  
  console.log('Middleware - Path:', request.nextUrl.pathname);
  console.log('Middleware - Token existe:', !!token);
  console.log('Middleware - É página pública:', isPublicPath);

  // Se está tentando acessar uma página pública e está logado, redirecionar para dashboard
  if (isPublicPath && token) {
    console.log('Redirecionando usuário logado para dashboard');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Se não está logado e tentando acessar uma página protegida, redirecionar para login
  if (!isPublicPath && !token) {
    console.log('Redirecionando usuário não logado para login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('Permitindo acesso');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
