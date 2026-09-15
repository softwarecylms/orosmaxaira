/**
 * Top of the Payload dashboard (`admin.components.beforeDashboard`): boxes for
 * the shop and the bookable experiences, which live in the Medusa admin — laid
 * out with Payload's own card classes so they sit in line with Collections.
 * «Orders» shows how many orders are waiting to be fulfilled.
 */

import { countNewOrders } from '@/lib/medusa/new-orders'
import NewOrdersBadge from './NewOrdersBadge'

// MEDUSA_ADMIN_URL is the admin's public address (https://shop.orosmaxaira.com).
const MEDUSA_ADMIN = `${(process.env.MEDUSA_ADMIN_URL || process.env.MEDUSA_BACKEND_URL || 'http://localhost:9009').replace(/\/$/, '')}/app`

const BOXES = [
  { icon: '🛒', label: 'Orders', path: '/orders', badge: true },
  { icon: '🍯', label: 'Products', path: '/products' },
  { icon: '🧾', label: 'Invoices', path: '/invoices' },
  { icon: '👤', label: 'Customers', path: '/customers' },
  { icon: '🏷️', label: 'Coupons', path: '/promotions' },
  { icon: '🐝', label: 'Activities', path: '/activities' },
  { icon: '🕯️', label: 'Workshops', path: '/workshops' },
  { icon: '🎒', label: 'School visits', path: '/school-program' },
]

export default async function ShopDashboard() {
  const newOrders = await countNewOrders()
  return (
    <div className="collections shop-dashboard">
      <div className="collections__wrap">
        <div className="collections__group">
          <h2 className="collections__label">Shop &amp; bookings</h2>
          <ul className="collections__card-list">
            {BOXES.map((box) => (
              <li key={box.path}>
                <a
                  href={`${MEDUSA_ADMIN}${box.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card card--has-onclick shop-dashboard__card"
                >
                  <h3 className="card__title">
                    <span className="dashboard-icon" aria-hidden="true">
                      {box.icon}
                    </span>
                    {box.label}
                    {'badge' in box ? <NewOrdersBadge initial={newOrders} /> : null}
                  </h3>
                  <span className="shop-dashboard__external" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
