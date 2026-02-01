import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/expenses/:path*",
        "/categories/:path*",
        "/settings/:path*",
        "/api/expenses/:path*",
        "/api/categories/:path*",
        "/api/stats/:path*",
    ],
};
