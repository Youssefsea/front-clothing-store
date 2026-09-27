import type { Locale } from "@/types";
const m = {
  en:{
    nav:{home:"Home",shop:"Shop",orders:"Orders",account:"Account",admin:"Admin",cart:"Cart",search:"Search",menu:"Menu"},
    common:{loading:"Loading",retry:"Try again",close:"Close",continue:"Continue",delete:"Delete",save:"Save",available:"Available",unavailable:"Unavailable"},
    home:{eyebrow:"VANTA / 2026",title:"Uniforms for your everyday.",body:"Modern silhouettes, honest materials, and a wardrobe designed to move with you.",shop:"Shop collection",explore:"Explore categories",categories:"Shop by category",featured:"Selected pieces",statement:"Fewer pieces. Stronger choices. Better wear.",editorial:"Built for the street. Refined for everywhere.",discover:"Discover VANTA"},
    shop:{title:"Shop",subtitle:"Discover the current collection.",search:"Search products",category:"Category",size:"Size",color:"Color",sort:"Sort",newest:"Newest",priceLow:"Price: low to high",priceHigh:"Price: high to low",all:"All",clear:"Clear filters",count:"products",noResults:"No products match your filters."},
    product:{size:"Size",color:"Color",quantity:"Quantity",add:"Add to cart",description:"Description",delivery:"Delivery",deliveryBody:"Delivery details are confirmed with our team after payment review.",unavailable:"Unavailable",related:"You may also like",choose:"Choose a size and color to continue."},
    auth:{login:"Log in",signup:"Create account",email:"Email",password:"Password",name:"Full name",phone:"Phone",otp:"Verification code",sendOtp:"Send code",newAccount:"New to VANTA?",existing:"Already have an account?",working:"Working...",invalid:"Please check your details and try again."},
    account:{title:"Your account",welcome:"Welcome back",details:"Account details",orders:"View orders",cart:"View cart",logout:"Log out"},
    orders:{title:"Orders",empty:"No orders yet.",error:"We could not load your orders.",order:"Order",status:"Status",placed:"Placed",total:"Total"},
    cart:{title:"Cart",empty:"Your cart is empty.",continue:"Continue shopping",summary:"Order summary",subtotal:"Subtotal",checkout:"Continue to checkout",unavailable:"Some items are currently unavailable.",remove:"Remove"},
    checkout:{title:"Checkout",address:"Delivery address",payment:"Payment method",screenshot:"Payment screenshot",upload:"Upload payment proof",vodafone:"Vodafone Cash",instapay:"InstaPay",submit:"Confirm order",working:"Confirming...",required:"A payment screenshot is required.",success:"Order received",successBody:"Your payment proof was uploaded and the order was created.",orders:"View orders",errors:"Complete the required fields."},
    admin:{title:"Admin",overview:"Overview",products:"Products",orders:"Orders",users:"Users",categories:"Categories",denied:"Admin access is required.",revenue:"Order value",categoryNote:"Categories are derived from products because the backend exposes no category CRUD.",add:"Add product",edit:"Edit product",action:"Action"}
  },
  ar:{
    nav:{home:"الرئيسية",shop:"المتجر",orders:"الطلبات",account:"الحساب",admin:"الإدارة",cart:"السلة",search:"بحث",menu:"القائمة"},
    common:{loading:"جارٍ التحميل",retry:"حاول مرة أخرى",close:"إغلاق",continue:"متابعة",delete:"حذف",save:"حفظ",available:"متاح",unavailable:"غير متاح"},
    home:{eyebrow:"فانتا / ٢٠٢٦",title:"قطع مصممة ليومك.",body:"قصّات عصرية، خامات واضحة، وخزانة تتحرك معك.",shop:"تسوق المجموعة",explore:"استكشف الأقسام",categories:"تسوق حسب القسم",featured:"قطع مختارة",statement:"قطع أقل. اختيارات أقوى. لبس أفضل.",editorial:"للشارع. مصقولة لكل مكان.",discover:"اكتشف فانتا"},
    shop:{title:"المتجر",subtitle:"اكتشف المجموعة الحالية.",search:"ابحث عن المنتجات",category:"القسم",size:"المقاس",color:"اللون",sort:"ترتيب",newest:"الأحدث",priceLow:"السعر: من الأقل",priceHigh:"السعر: من الأعلى",all:"الكل",clear:"مسح الفلاتر",count:"منتج",noResults:"لا توجد منتجات تطابق اختياراتك."},
    product:{size:"المقاس",color:"اللون",quantity:"الكمية",add:"أضف للسلة",description:"الوصف",delivery:"التوصيل",deliveryBody:"يتم تأكيد تفاصيل التوصيل مع فريقنا بعد مراجعة الدفع.",unavailable:"غير متاح",related:"قد يعجبك أيضًا",choose:"اختر المقاس واللون للمتابعة."},
    auth:{login:"تسجيل الدخول",signup:"إنشاء حساب",email:"البريد الإلكتروني",password:"كلمة المرور",name:"الاسم الكامل",phone:"رقم الهاتف",otp:"رمز التحقق",sendOtp:"إرسال الرمز",newAccount:"جديد في فانتا؟",existing:"لديك حساب بالفعل؟",working:"جارٍ التنفيذ...",invalid:"راجع البيانات وحاول مرة أخرى."},
    account:{title:"حسابك",welcome:"مرحبًا بعودتك",details:"بيانات الحساب",orders:"عرض الطلبات",cart:"عرض السلة",logout:"تسجيل الخروج"},
    orders:{title:"الطلبات",empty:"لا توجد طلبات بعد.",error:"تعذر تحميل طلباتك.",order:"الطلب",status:"الحالة",placed:"التاريخ",total:"الإجمالي"},
    cart:{title:"السلة",empty:"سلتك فارغة.",continue:"متابعة التسوق",summary:"ملخص الطلب",subtotal:"الإجمالي الفرعي",checkout:"المتابعة للدفع",unavailable:"بعض المنتجات غير متاحة حاليًا.",remove:"حذف"},
    checkout:{title:"الدفع",address:"عنوان التوصيل",payment:"طريقة الدفع",screenshot:"صورة الدفع",upload:"ارفع إثبات الدفع",vodafone:"فودافون كاش",instapay:"إنستا باي",submit:"تأكيد الطلب",working:"جارٍ التأكيد...",required:"صورة الدفع مطلوبة.",success:"تم استلام الطلب",successBody:"تم رفع إثبات الدفع وإنشاء الطلب.",orders:"عرض الطلبات",errors:"أكمل الحقول المطلوبة."},
    admin:{title:"الإدارة",overview:"نظرة عامة",products:"المنتجات",orders:"الطلبات",users:"المستخدمون",categories:"الأقسام",denied:"صلاحية الإدارة مطلوبة.",revenue:"قيمة الطلبات",categoryNote:"الأقسام مشتقة من المنتجات لأن الـbackend لا يوفر CRUD للأقسام.",add:"إضافة منتج",edit:"تعديل منتج",action:"الإجراء"}
  }
} as const;
type Group = keyof typeof m.en;
export type TKey = { [G in Group]: G extends "nav"|"common"|"home"|"shop"|"product"|"auth"|"account"|"orders"|"cart"|"checkout"|"admin" ? `${G}.${Extract<keyof typeof m.en[G],string>}` : never }[Group];
export function createT(locale:Locale){return (key:TKey)=>{const [g,k]=key.split(".");const group=m[locale][g as Group] as Record<string,string>;return group[k]??key;};}
