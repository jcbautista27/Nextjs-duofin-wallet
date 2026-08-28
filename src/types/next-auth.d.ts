import type { DefaultSession } from "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      spaceId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    spaceId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    spaceId?: string | null;
  }
}
