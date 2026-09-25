'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { Profile, UserRole } from '@/lib/auth';
import type { Product } from '@/types';
import { brand } from '@/lib/brand';

type AdminView = 'orders' | 'customers' | 'admins' | 'catalogue';

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  city: string;
  payment_method: string;
  payment_status: string | null;
  status: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  total_amount: number;
  created_at: string;
}

const formatDate = (date: string) => new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date(date));
const formatPrice = (amount: number) => `PKR ${Number(amount).toLocaleString('en-PK')}`;
const statusClass = (value: string) => value.toLowerCase().replace(/\s+/g, '-');
const unsafeProfileReference = /locacollection1/i;

const sanitizeProfileValue = (value: string | null | undefined, fallback: string) => {
  if (!value || unsafeProfileReference.test(value)) return fallback;
  return value;
};

const sanitizeProfile = (profile: Profile): Profile => ({
  ...profile,
  display_name: sanitizeProfileValue(profile.display_name, 'Legacy Goods Admin'),
  email: sanitizeProfileValue(profile.email, 'Email unavailable'),
});

export default function AdminStudio() {
  const router = useRouter();
  const { user, profile, isAdmin, loading, profileLoading, signOut } = useAuth();
  const [view, setView] = useState<AdminView>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('All');
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) {
      router.replace('/login.html?next=/admin.html');
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, loading, profileLoading, router, user]);

  const loadView = useCallback(async () => {
    if (!isAdmin) return;
    setDataLoading(true);
    setError('');
    try {
      if (view === 'orders') {
        const { data, error: ordersError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (ordersError) throw ordersError;
        setOrders((data ?? []) as OrderRecord[]);
      } else if (view === 'customers') {
        const { data, error: customersError } = await supabase.from('profiles').select('id, email, role, admin_seq_id, display_name, created_at').eq('role', 'customer').order('created_at', { ascending: false });
        if (customersError) throw customersError;
        setCustomers((data ?? []).filter((item) => item.role === 'customer').map((item) => sanitizeProfile(item as Profile)));
      } else if (view === 'admins') {
        const { data, error: adminsError } = await supabase.from('profiles').select('id, email, role, admin_seq_id, display_name, created_at').eq('role', 'admin').order('created_at', { ascending: true });
        if (adminsError) throw adminsError;
        setAdmins((data ?? []).filter((item) => item.role === 'admin').map((item) => sanitizeProfile(item as Profile)));
      } else {
        const { data, error: productsError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (productsError) throw productsError;
        setProducts((data ?? []) as Product[]);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Studio data.');
    } finally {
      setDataLoading(false);
    }
  }, [isAdmin, view]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadView(), 0);
    return () => window.clearTimeout(timer);
  }, [loadView]);

  const changeRole = async (profileId: string, role: UserRole) => {
    setActionId(profileId);
    setError('');
    const { error: updateError } = await supabase.from('profiles').update({ role }).eq('id', profileId);
    if (updateError) setError(updateError.message);
    await loadView();
    setActionId('');
  };

  const archiveOrder = async (orderId: string) => {
    if (!window.confirm('Archive this order? This removes it from the active order desk.')) return;
    setActionId(orderId);
    const { error: deleteError } = await supabase.from('orders').delete().eq('id', orderId);
    if (deleteError) setError(deleteError.message);
    await loadView();
    setActionId('');
  };

  const visibleOrders = orders.filter((order) => {
    const text = `${order.id} ${order.customer_name} ${order.customer_email} ${order.city}`.toLowerCase();
    const matchesSearch = text.includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatus === 'All' || (order.payment_status ?? 'Pending').toLowerCase().includes(orderStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });
  const paidRevenue = orders.filter((order) => (order.payment_status ?? '').toLowerCase().includes('paid')).reduce((sum, order) => sum + Number(order.total_amount), 0);
  const inProgress = orders.filter((order) => !['delivered', 'returned', 'cancelled'].includes((order.status ?? 'pending').toLowerCase())).length;
  const delivered = orders.filter((order) => ['delivered', 'returned'].includes((order.status ?? '').toLowerCase())).length;

  if (loading || profileLoading || !user || !isAdmin) {
    return <main className="admin-loading">Verifying Studio access...</main>;
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="brand-lockup"><span className="monogram">LG</span><span><strong>{brand.name}</strong><small>ATELIER DESK</small></span></Link>
        <div className="admin-header-actions"><span className="admin-badge">{profile?.admin_seq_id ?? 'ADMIN'}</span><Link href="/" className="admin-view-store">↗ View store</Link><button type="button" onClick={() => void signOut()} className="admin-logout">Log out</button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow text-[#c5a059]">Operations desk</p>
          <h1>Admin Studio</h1>
          <p className="admin-sidebar-copy">Orders, people and the live catalogue in one focused desk.</p>
          <nav className="admin-tabs" aria-label="Admin Studio sections">
            <button type="button" onClick={() => setView('orders')} className={view === 'orders' ? 'active' : ''}><span>01</span>Orders &amp; Fulfillment</button>
            <button type="button" onClick={() => setView('customers')} className={view === 'customers' ? 'active' : ''}><span>02</span>Registered Users</button>
            <button type="button" onClick={() => setView('admins')} className={view === 'admins' ? 'active' : ''}><span>03</span>Admins Desk</button>
            <button type="button" onClick={() => setView('catalogue')} className={view === 'catalogue' ? 'active' : ''}><span>04</span>Catalogue Management</button>
          </nav>
        </aside>
        <section className="admin-content">
          <div className="admin-content-header"><div><p className="eyebrow text-[#7c6232]">{view === 'orders' ? 'Orders & Fulfillment' : view === 'customers' ? 'Customer directory' : view === 'admins' ? 'Restricted directory' : 'Product catalogue'}</p><h2>{view === 'orders' ? 'The latest orders.' : view === 'customers' ? 'Registered users.' : view === 'admins' ? 'Admins Desk.' : 'The live edit.'}</h2></div><button type="button" onClick={() => void loadView()} className="admin-refresh">Refresh</button></div>
          {view === 'orders' && <div className="admin-metrics"><div><span>Total orders</span><strong>{orders.length}</strong></div><div><span>In progress</span><strong>{inProgress}</strong></div><div><span>Delivered</span><strong>{delivered}</strong></div><div><span>Paid revenue</span><strong>{formatPrice(paidRevenue)}</strong></div></div>}
          {error && <p className="admin-error">{error}</p>}
          {dataLoading ? <div className="admin-empty">Loading Studio data...</div> : view === 'orders' ? (
            <div className="admin-table-wrap"><div className="admin-table-tools"><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search orders or customers" aria-label="Search orders" /><select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} aria-label="Filter order status"><option>All</option><option>Pending</option><option>Paid</option><option>Fulfilled</option><option>Delivered</option></select></div><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Fulfilment</th><th>Payment</th><th>Total</th><th>Placed</th><th /></tr></thead><tbody>{visibleOrders.map((order) => { const fulfillment = order.status ?? 'Pending'; const payment = order.payment_status ?? 'Unpaid'; return <tr key={order.id}><td className="admin-code">{order.id.slice(0, 8)}</td><td><strong>{order.customer_name}</strong><small>{order.customer_email}</small>{order.cancelled_by && <small className="cancellation-note">Cancelled by {order.cancelled_by.toLowerCase()}{order.cancellation_reason ? ` - ${order.cancellation_reason}` : ''}</small>}</td><td>{order.city}</td><td><span className={`status-pill status-${statusClass(fulfillment)}`}>{fulfillment}</span></td><td><span className={`status-pill payment-${statusClass(payment)}`}>{payment}</span></td><td>{formatPrice(order.total_amount)}</td><td>{formatDate(order.created_at)}</td><td><button type="button" disabled={actionId === order.id} onClick={() => void archiveOrder(order.id)} className="directory-action">Archive</button></td></tr>; })}</tbody></table>{visibleOrders.length === 0 && <div className="admin-empty">No matching orders.</div>}</div>
          ) : view === 'customers' ? (
            <div className="admin-directory">{customers.map((customer) => <article className="directory-row" key={customer.id}><div className="directory-avatar">{(customer.display_name ?? 'C').slice(0, 1).toUpperCase()}</div><div><strong>{customer.display_name ?? 'Customer'}</strong><small>{customer.email ?? customer.id}</small></div><span>{formatDate(customer.created_at)}</span><button type="button" disabled={actionId === customer.id} onClick={() => void changeRole(customer.id, 'admin')} className="directory-action">Promote to admin</button></article>)}{customers.length === 0 && <div className="admin-empty">No customer profiles found.</div>}</div>
          ) : view === 'admins' ? (
            <div className="admin-directory">{admins.map((admin) => <article className="directory-row" key={admin.id}><div className="directory-avatar admin">✦</div><div><strong>{admin.admin_seq_id ?? 'ADMIN'}</strong><small>{admin.email ?? 'Email unavailable'}</small></div><span>{formatDate(admin.created_at)}</span><button type="button" disabled={actionId === admin.id || admin.id === user.id} onClick={() => void changeRole(admin.id, 'customer')} className="directory-action">{admin.id === user.id ? 'Current account' : 'Demote'}</button></article>)}{admins.length === 0 && <div className="admin-empty">No admin profiles found.</div>}</div>
          ) : (
            <div className="catalogue-grid">{products.map((product) => <article className="catalogue-item" key={product.id}><div><p className="eyebrow text-[#7c6232]">Active product</p><h3>{product.title}</h3><p>{product.description}</p></div><strong>{formatPrice(product.price)}</strong></article>)}{products.length === 0 && <div className="admin-empty">No catalogue products found.</div>}</div>
          )}
        </section>
      </div>
    </main>
  );
}
