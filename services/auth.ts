import { apiRequest } from "./api";
import type { User } from "@/types";
export const authService = {
 login:(body:{email:string;password:string})=>apiRequest<{message:string;user:User;token?:string}>("/login",{method:"POST",body:JSON.stringify(body)}),
 sendOtp:(body:{email:string;phone:string})=>apiRequest<{message:string}>("/send-otp",{method:"POST",body:JSON.stringify(body)}),
 signup:(body:{name:string;email:string;password:string;phone:string;otp:string})=>apiRequest<{message:string}>("/signup",{method:"POST",body:JSON.stringify(body)}),
 session:()=>apiRequest<{name:string;email:string}>("/isLoggedIn"),
 logout:()=>apiRequest<{message:string}>("/logout",{method:"POST"})
};
