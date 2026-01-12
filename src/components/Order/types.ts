export interface MealOrder {
  id: string
  dish_name: string
  requester: string
  status: 'pending' | 'cooking' | 'delivered' | 'cancelled'
  note: string | null
  order_type?: 'menu' | 'custom'
  created_at: string
}
