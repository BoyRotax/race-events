"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") fetchUsers();
  }, [status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    setProcessingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('✅ Role updated successfully!');
        fetchUsers(); // โหลดข้อมูลใหม่เพื่ออัปเดตตาราง
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (err) {
      alert('Error communicating with server.');
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || loading) return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#E43138] font-black tracking-widest"><i className="fas fa-spinner fa-spin mr-3"></i> LOADING USERS...</div>;
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return <div className="min-h-screen bg-[#111] flex justify-center items-center text-white text-2xl font-black uppercase">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto mt-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <Link href="/admin" className="text-gray-500 hover:text-white text-sm font-bold transition mb-2 inline-block"><i className="fas fa-arrow-left mr-2"></i> BACK TO CONTROL PANEL</Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#cba052]">Users & Teams <span className="text-gray-600 font-bold text-xl">({users.length})</span></h1>
          </div>
          <button onClick={fetchUsers} className="mt-4 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-bold transition">
            <i className="fas fa-sync-alt mr-2"></i> REFRESH
          </button>
        </div>

        {/* ตารางรายชื่อ */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold">Team / User Name</th>
                <th className="p-4 font-bold">Email Address</th>
                <th className="p-4 font-bold text-center">Drivers in Garage</th>
                <th className="p-4 font-bold text-center">Current Role</th>
                <th className="p-4 font-bold text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-600 font-bold uppercase">No users found</td></tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-[#1a1a1a] transition ${idx % 2 === 0 ? 'bg-transparent' : 'bg-black/20'}`}>
                    <td className="p-4">
                      <p className="font-bold text-white uppercase">{u.name || 'Unnamed Team'}</p>
                      <p className="text-[10px] text-gray-600 font-mono">ID: {u.id.substring(0,8)}</p>
                    </td>
                    <td className="p-4 text-gray-300">{u.email}</td>
                    
                    {/* จำนวนนักแข่งในคลัง */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-black rounded-full ${u._count.drivers > 0 ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : 'bg-gray-800 text-gray-500'}`}>
                        {u._count.drivers} Drivers
                      </span>
                    </td>

                    {/* ป้ายสถานะ (Role) */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest 
                        ${u.role === 'ADMIN' ? 'bg-purple-900/50 text-purple-400 border border-purple-700' : 
                          u.role === 'VIP' ? 'bg-[#cba052]/20 text-[#cba052] border border-[#cba052]/50' : 
                          'bg-gray-800 text-gray-400 border border-gray-600'}`}>
                        {u.role === 'USER' ? 'NORMAL USER' : u.role}
                      </span>
                    </td>

                    {/* ปุ่มเปลี่ยนสิทธิ์ */}
                    <td className="p-4 text-right">
                      {/* ดักไม่ให้แอดมินปลดตัวเอง */}
                      {u.id === (session?.user as any)?.id ? (
                        <span className="text-xs text-gray-500 font-bold uppercase"><i className="fas fa-lock mr-1"></i> Cannot edit self</span>
                      ) : (
                        <select 
                          className="bg-black border border-gray-700 text-gray-300 text-xs font-bold rounded px-2 py-1 outline-none focus:border-[#E43138] cursor-pointer"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={processingId === u.id}
                        >
                          <option value="USER">NORMAL USER</option>
                          <option value="VIP">VIP TEAM</option>
                          <option value="ADMIN">ADMINISTRATOR</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}