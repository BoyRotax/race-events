"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ENTRY_FEES: Record<string, number> = {
  'Micro MAX': 21000, 'Mini MAX': 27500, 'Junior MAX': 29000,
  'Senior MAX': 30000, 'Senior MAX Masters': 30000,
  'MAX DD2': 30000, 'MAX DD2 Masters': 30000,
};

const formatTHB = (amount: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);

export default function CheckoutPage() {
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slipImage, setSlipImage] = useState<string>("");

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch("/api/team");
        if (res.ok) {
          const json = await res.json();
          // กรองเอาเฉพาะคนที่ค้างจ่าย
          const unpaid = (json.data || []).filter((d: any) => d.payment === 'PENDING' && d.events.length > 0);
          setPendingItems(unpaid);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const totalAmount = pendingItems.reduce((sum, item) => {
    const fee = ENTRY_FEES[item.category] || 0;
    return sum + (fee * item.events.length);
  }, 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) return alert("ขนาดไฟล์รูปเกิน 3MB ครับ");
      const reader = new FileReader();
      reader.onloadend = () => setSlipImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!slipImage) return alert("กรุณาอัปโหลดสลิปโอนเงินก่อนครับ");
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipImageUrl: slipImage })
      });
      if (res.ok) {
        alert("✅ ส่งหลักฐานการโอนเงินสำเร็จ! กรุณารอแอดมินตรวจสอบครับ");
        router.push('/vip');
      } else {
        alert("❌ เกิดข้อผิดพลาดในการส่งข้อมูล");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#cba052] font-black tracking-widest">LOADING INVOICE...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-4xl mx-auto mt-4">
        
        <div className="mb-8 border-b border-gray-800 pb-4">
          <Link href="/vip" className="text-gray-500 hover:text-white text-sm font-bold transition mb-2 inline-block"><i className="fas fa-arrow-left mr-2"></i> BACK TO GARAGE</Link>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#cba052]">Team <span className="text-white">Invoice & Payment</span></h1>
        </div>

        {pendingItems.length === 0 ? (
          <div className="bg-[#111] p-10 rounded-xl border border-gray-800 text-center">
            <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
            <h3 className="text-xl font-bold text-white uppercase mb-2">No Pending Payments</h3>
            <p className="text-gray-500">ทีมของคุณชำระค่าสมัครครบทุกรายการแล้วครับ</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 🧾 ตารางสรุปยอด */}
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-lg">
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tight mb-4 border-b border-gray-800 pb-2"><i className="fas fa-receipt mr-2"></i> Registration Details</h3>
              <div className="space-y-4">
                {pendingItems.map((item, idx) => {
                  const baseFee = ENTRY_FEES[item.category] || 0;
                  const itemTotal = baseFee * item.events.length;
                  return (
                    <div key={idx} className="flex justify-between items-center bg-black p-4 rounded border border-gray-800">
                      <div>
                        <p className="font-bold text-white uppercase">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">{item.category} (No. {item.racingNumber}) | {item.events.join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#cba052] font-black">{formatTHB(itemTotal)}</p>
                        <p className="text-[10px] text-gray-600">{formatTHB(baseFee)} x {item.events.length} Event(s)</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-end">
                <p className="text-gray-500 font-bold uppercase tracking-widest">Total Amount Due</p>
                <p className="text-4xl font-black text-[#E43138]">{formatTHB(totalAmount)}</p>
              </div>
            </div>

            {/* 🏦 ช่องทางชำระเงิน & อัปโหลดสลิป */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-tight mb-4 border-b border-gray-800 pb-2"><i className="fas fa-university mr-2"></i> Payment Instructions</h3>
                <div className="bg-black p-4 rounded border border-gray-800 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Bank Name</p>
                  <p className="font-bold text-white text-lg">Kasikorn Bank (KBank)</p>
                </div>
                <div className="bg-black p-4 rounded border border-gray-800 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Account Name</p>
                  <p className="font-bold text-[#cba052] text-lg">Rotax Racing Asia Co., Ltd.</p>
                </div>
                <div className="bg-black p-4 rounded border border-[#E43138]/50 mb-4">
                  <p className="text-xs text-[#E43138] uppercase font-bold mb-1">Account Number</p>
                  <p className="font-black text-white text-2xl tracking-wider">123-4-56789-0</p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#cba052]/50 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight mb-4 border-b border-gray-800 pb-2"><i className="fas fa-file-upload mr-2"></i> Upload Payment Slip</h3>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#E43138] file:text-white hover:file:bg-red-700 cursor-pointer mb-4" />
                  {slipImage && (
                    <div className="relative h-40 w-full rounded border border-gray-700 overflow-hidden mb-4">
                      <img src={slipImage} alt="Slip Preview" className="absolute inset-0 w-full h-full object-contain bg-black" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={handlePaymentSubmit} 
                  disabled={submitting || !slipImage} 
                  className="w-full py-4 font-black tracking-widest text-white bg-[#E43138] rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_20px_rgba(228,49,56,0.3)]"
                >
                  {submitting ? 'PROCESSING...' : 'SUBMIT PAYMENT'}
                </button>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}