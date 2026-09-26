import { ProductDetailsClient } from "@/components/product/product-details-client";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailsClient productId={id} />;
}
