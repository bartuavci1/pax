import React, { useState, useEffect } from 'react';

const statusMap = { pending: '⏳ Beklemede', processing: '🔄 İşleniyor', shipped: '🚚 Kargoda', delivered: '✅ Teslim Edildi', cancelled: '❌ İptal' };
const statusColor = { pending: '#f59e0b', processing: '#6c63ff', shipped: '#3b82f6', delivered: '#22c55e', cancelled: '#ef4444' };

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/api/orders/', {
      headers: { Authorization: `Bearer ${getToken()}` }
    }).then(r => r.json()).then(d => { setOrders(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const showDetail = async (order) => {
    if (selectedOrder?.id === order.id) { setSelectedOrder(null); setOrderDetail(null); return; }
    setSelectedOrder(order);
    const res = await fetch(`http://localhost:8000/api/orders/${order.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setOrderDetail(data);
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="section">
      <div className="container">
        <h1 style={{ marginBottom: '32px' }}>Siparişlerim</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3rem' }}>📦</div>
            <h3 style={{ marginTop: '16px' }}>Henüz siparişiniz yok</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => (
              <div key={order.id}>
                <div
                  className="card"
                  style={{ padding: '24px', cursor: 'pointer' }}
                  onClick={() => showDetail(order)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Sipariş #{order.id}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                        {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: statusColor[order.status] + '20', color: statusColor[order.status], padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600 }}>
                        {statusMap[order.status]}
                      </span>
                      <p style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '8px', color: 'var(--accent)' }}>{order.total_amount?.toFixed(2)} ₺</p>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                      {selectedOrder?.id === order.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Sipariş Detayı */}
                {selectedOrder?.id === order.id && orderDetail && (
                  <div style={{ background: 'white', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '24px' }}>
                    <h4 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Sipariş İçeriği</h4>
                    {orderDetail.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <img
                          src={`https://picsum.photos/seed/${item.product_id}/80/80`}
                          alt="ürün"
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600 }}>{item.product_name || `Ürün #${item.product_id}`}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Adet: {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: 'var(--accent)' }}>{(item.price_at_purchase * item.quantity).toFixed(2)} ₺</p>
                      </div>
                    ))}
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                      <span>Toplam</span>
                      <span style={{ color: 'var(--accent)' }}>{order.total_amount?.toFixed(2)} ₺</span>
                    </div>
                    {orderDetail.shipping_address && (
                      <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '8px' }}>
                        <p style={{ fontWeight: 600, marginBottom: '8px' }}>📦 Teslimat Adresi</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          {orderDetail.shipping_address.full_name} - {orderDetail.shipping_address.address}, {orderDetail.shipping_address.city}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}