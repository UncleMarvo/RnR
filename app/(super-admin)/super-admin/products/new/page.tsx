import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader"
import { ProductForm } from "@/components/admin/super/ProductForm"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create Product"
        description="Add a new product to the catalog"
      />

      <ProductForm mode="create" />
    </div>
  )
}
