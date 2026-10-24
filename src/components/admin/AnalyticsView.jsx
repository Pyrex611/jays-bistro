import React from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { TrendingUp, ShoppingBag, DollarSign, Award } from 'lucide-react';

const AnalyticsView = () => {
  const { analytics } = useStore();

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-caramel-50 border border-caramel-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-caramel-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <DollarSign size={13} /> Revenue
          </div>
          <p className="text-base sm:text-lg font-black text-caramel-950">
            ₦{analytics.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[9px] text-caramel-700 font-semibold">+18% this week</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-stone-600 text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShoppingBag size={13} /> Orders
          </div>
          <p className="text-base sm:text-lg font-black text-stone-900">
            {analytics.totalOrders}
          </p>
          <span className="text-[9px] text-green-600 font-semibold">Active dispatch</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
          <div className="flex items-center gap-1.5 text-stone-600 text-[10px] font-bold uppercase tracking-wider mb-1">
            <TrendingUp size={13} /> Avg Tray
          </div>
          <p className="text-base sm:text-lg font-black text-stone-900">
            ₦{analytics.averageOrderValue.toLocaleString()}
          </p>
          <span className="text-[9px] text-stone-400 font-semibold">Per WhatsApp ticket</span>
        </div>
      </div>

      {/* Top Performing Dishes */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-caramel-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900">Top Velocity Dishes</h4>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">By Revenue</span>
        </div>

        <div className="space-y-2.5">
          {analytics.topDishes.map((dish, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">
                  #{i + 1}
                </span>
                <span className="font-semibold text-stone-800">{dish.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900">₦{dish.revenue.toLocaleString()}</span>
                <span className="text-[10px] text-stone-400 ml-1.5">({dish.orders} sold)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Chart Bars */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-3">
          Weekly Revenue Trajectory
        </h4>
        <div className="flex items-end justify-between h-28 pt-4 gap-2">
          {[
            { day: 'Mon', h: '45%' },
            { day: 'Tue', h: '30%' },
            { day: 'Wed', h: '60%' },
            { day: 'Thu', h: '75%' },
            { day: 'Fri', h: '95%' },
            { day: 'Sat', h: '100%' },
            { day: 'Sun', h: '80%' },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-stone-100 rounded-t h-full flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-caramel-600 to-caramel-400 rounded-t transition-all duration-500" 
                  style={{ height: bar.h }}
                />
              </div>
              <span className="text-[9px] font-bold text-stone-500">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;