'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { Profile, UserRole } from '@/lib/auth';

type AdminView = 'orders' | 'customers' | 'admins';

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  city: string;
  payment_method: string;
  payment_status: string | null;
  total_amount: number;
  created_at: string;
}

const formatDate = (date: string) => new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date(date));
const formatPrice = (amount: number) => `PKR ${Number(amount).toLocaleString('en-PK')}`;

export default function AdminStudio() {
  const router = useRouter();
  const { user, profile, isAdmin, loading, profileLoading, signOut } = useAuth();
  const [view, setView] = useState<AdminView>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) {
      router.replace('/login?next=/admin');
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
        const { data, error: customersError } = await supabase.from('profiles').select('id, email, role, admin_identifier, display_name, created_at').eq('role', 'customer').order('created_at', { ascending: false });
        if (customersError) throw customersError;
        setCustomers((data ?? []).filter((item) => item.role === 'customer') as Profile[]);
      } else {
        const { data, error: adminsError } = await supabase.from('profiles').select('id, email, role, admin_identifier, display_name, created_at').eq('role', 'admin').order('created_at', { ascending: true });
        if (adminsError) throw adminsError;
        setAdmins((data ?? []).filter((item) => item.role === 'admin') as Profile[]);
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

  if (loading || profileLoading || !user || !isAdmin) {
    return <main className="admin-loading">Verifying Studio access...</main>;
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="brand-lockup"><span className="monogram">LG</span><span><strong>LEGACY GOODS</strong><small>ADMIN STUDIO</small></span></Link>
        <div className="admin-header-actions"><span className="admin-badge">{profile?.admin_identifier ?? 'ADMIN'}</span><Link href="/" className="admin-view-store">↗ View store</Link><button type="button" onClick={() => void signOut()} className="admin-logout">Log out</button></div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow text-[#c5a059]">Operations desk</p>
          <h1>Admin Studio</h1>
          <p className="admin-sidebar-copy">A quiet view into the people, orders, and work behind the collection.</p>
          <nav className="admin-tabs" aria-label="Admin Studio sections">
            <button type="button" onClick={() => setView('orders')} className={view === 'orders' ? 'active' : ''}><span>01</span>Orders &amp; Fulfillment</button>
            <button type="button" onClick={() => setView('customers')} className={view === 'customers' ? 'active' : ''}><span>02</span>Registered Users</button>
            <button type="button" onClick={() => setView('admins')} className={view === 'admins' ? 'active' : ''}><span>03</span>Admins Desk</button>
          </nav>
        </aside>
        <section className="admin-content">
          <div className="admin-content-header"><div><p className="eyebrow text-[#7c6232]">{view === 'orders' ? 'Orders & Fulfillment' : view === 'customers' ? 'Customer directory' : 'Restricted directory'}</p><h2>{view === 'orders' ? 'The latest orders.' : view === 'customers' ? 'Registered users.' : 'Admins Desk.'}</h2></div><button type="button" onClick={() => void loadView()} className="admin-refresh">Refresh</button></div>
          {error && <p className="admin-error">{error}</p>}
          {dataLoading ? <div className="admin-empty">Loading Studio data...</div> : view === 'orders' ? (
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>City</th><th>Status</th><th>Total</th><th>Placed</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="admin-code">{order.id.slice(0, 8)}</td><td><strong>{order.customer_name}</strong><small>{order.customer_email}</small></td><td>{order.city}</td><td><span className="status-pill">{order.payment_status ?? 'Pending'}</span></td><td>{formatPrice(order.total_amount)}</td><td>{formatDate(order.created_at)}</td></tr>)}</tbody></table>{orders.length === 0 && <div className="admin-empty">No orders have arrived yet.</div>}</div>
          ) : view === 'customers' ? (
            <div className="admin-directory">{customers.map((customer) => <article className="directory-row" key={customer.id}><div className="directory-avatar">{(customer.display_name ?? 'C').slice(0, 1).toUpperCase()}</div><div><strong>{customer.display_name ?? 'Customer'}</strong><small>{customer.email ?? customer.id}</small></div><span>{formatDate(customer.created_at)}</span><button type="button" disabled={actionId === customer.id} onClick={() => void changeRole(customer.id, 'admin')} className="directory-action">Promote to admin</button></article>)}{customers.length === 0 && <div className="admin-empty">No customer profiles found.</div>}</div>
          ) : (
            <div className="admin-directory">{admins.map((admin) => <article className="directory-row" key={admin.id}><div className="directory-avatar admin">✦</div><div><strong>{admin.admin_identifier ?? 'ADMIN'}</strong><small>{admin.email ?? 'Email unavailable'}</small></div><span>{formatDate(admin.created_at)}</span><button type="button" disabled={actionId === admin.id || admin.id === user.id} onClick={() => void changeRole(admin.id, 'customer')} className="directory-action">{admin.id === user.id ? 'Current account' : 'Demote'}</button></article>)}{admins.length === 0 && <div className="admin-empty">No admin profiles found.</div>}</div>
          )}
        </section>
      </div>
    </main>
  );
}
