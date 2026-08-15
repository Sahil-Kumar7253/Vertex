import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    if(pathname.startsWith('/workspaces')){
        if(!token){
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if(pathname === '/login' || pathname === '/register'){
        if(token){
            return NextResponse.redirect(new URL('/workspaces', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher : [
        '/workspaces/:path*',
        '/login',
        '/register'
    ],
};

