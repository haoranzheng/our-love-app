export interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  is_available: boolean
}

export interface CartItem extends Dish {
  count: number
}
