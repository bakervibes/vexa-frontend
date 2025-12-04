import type { Coupon, Order, OrderItem, Payment, User } from './models'

/**
 * Commande avec items et paiements
 * Correspond au retour de createOrder et getUserOrders
 */
export interface OrderItemData {
  name: string
  sku: string
  quantity: number
  price: number
  image: string
  variant: {
    sku: string
    options: { attribute: string; option: string }[]
  } | null
}

export interface UserOrder extends Order {
  items: OrderItem[]
  payments: Payment[]
  coupon: Coupon | null
}

/**
 * Commande avec items, paiements et informations utilisateur
 * Correspond au retour de getOrder (détail d'une commande)
 */
export interface OrderDetails extends UserOrder {
  user: Pick<User, 'id' | 'name' | 'email'>
}
