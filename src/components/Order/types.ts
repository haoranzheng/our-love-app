export interface MealOrder {
  id: string
  dish_name: string
  requester: string
  status: 'pending' | 'cooking' | 'delivered' | 'cancelled'
  note: string | null
  order_type?: 'menu' | 'custom'
  created_at: string
}

export interface LovePoints {
  id: string
  current_balance: number
  total_earned: number
  total_spent: number
  updated_at: string
}
