import React from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { X, Sparkles, Clock, MapPin, Tag } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Weekend Barbecue Night",
    body: "Join us this Friday from 6 PM for wood-smoked whole lamb & live Makurdi grills.",
    time: "2h ago",
    icon: Sparkles
  },
  {
    id: 2,
    title: "10% Off Arabian Tea Packs",
    body: "Brew your favorite heritage tea at home. 10% discount automatically applied today.",
    time: "1d ago",
    icon: Tag
  },
  {
    id: 3,
    title: "Operating Hours Notice",
    body: "Kitchen opens daily 8:00 AM – 10:00 PM. Tuesday scheduled deep sanitization.",
    time: "3d ago",
    icon: Clock
  }
];

const NotificationsModal = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useStore();

  if (!isNotificationsOpen) return null;

  return (
    <div
      onClick={() => setIsNotificationsOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
      >
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <h3 className="font-bold text-base text-stone-900">Bistro Announcements</h3>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            aria-label="Close"
            className="p-1 hover:bg-stone-200 rounded-full text-stone-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-caramel-100 text-caramel-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-stone-900">{n.title}</h4>
                    <span className="text-[10px] text-stone-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-snug">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-stone-100 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500 font-medium">Precious Events Centre, Makurdi, Benue State</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;