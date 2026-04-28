import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            role: string;
            currency: string;
            theme: string;
        };
    }

    interface User {
        role: string;
        currency: string;
        theme: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}
