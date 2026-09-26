export const validateEmail=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const validatePhone=(v:string)=>/^[0-9]{10,15}$/.test(v.trim());
export const validatePassword=(v:string)=>v.length>=6;
export const validateAddress=(v:string)=>v.trim().length>=10&&v.trim().length<=300;