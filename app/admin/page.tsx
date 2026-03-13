"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.data);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      body: JSON.stringify({ userId, role: newRole }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      alert("✅ อัปเดตสิทธิ์สำเร็จ");
      fetchUsers(); // โหลดข้อมูลใหม่
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-purple-600 p-4 rounded-xl shadow-lg">
            <i className="fas fa-shield-alt text-white text-3xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">System Admin</h2>
            <p className="text-gray-500 font-bold">ระบบจัดการผู้ใช้งานและสิทธิ์การเข้าถึง (Role Management)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between">
            <h3 className="font-bold text-gray-700"><i className="fas fa-users mr-2"></i> Registered Accounts</h3>
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">Total: {users.length}</span>
          </div>
          
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b-2 border-gray-200">
                <th className="p-4">Name / Team</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-bold">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-800">{user.name}</td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-black tracking-widest
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                        user.role === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                        user.role === 'STAFF' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="p-2 bg-white border border-gray-300 rounded outline-none focus:border-purple-500 font-bold text-sm cursor-pointer shadow-sm"
                    >
                      <option value="USER">USER (นักแข่งอิสระ)</option>
                      <option value="VIP">VIP (ผู้จัดการทีม)</option>
                      <option value="STAFF">STAFF (กรรมการ/ตรวจสภาพ)</option>
                      <option value="ADMIN">ADMIN (ผู้จัด)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}