import type { APIRoute } from "astro";
 
export const POST: APIRoute = async ({ cookies, redirect }) => {
    console.log(redirect);
    cookies.set("status", "Success!!!", {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
    });
    
    return redirect("/test");
};