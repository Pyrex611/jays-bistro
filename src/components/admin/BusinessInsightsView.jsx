import React from 'react';
import { useStore } from '../../context/StoreContext.jsx';
import { 
  TrendingUp, BarChart, PieChart, ShieldAlert, 
  Lightbulb, CheckCircle2, ArrowUpRight, Target, Clock, Zap
} from 'lucide-react';

const BusinessInsightsView = () => {
  const { analytics, products } = useStore();

  // Menu Engineering Classification (BCG / Menu Matrix)
  const menuMatrix = [
    { name: "Party Jollof Rice", quadrant: "Star", margin: "74%", popularity: "High", action: "Maintain recipe consistency & hero visibility." },
    { name: "Basmati Fried Rice", quadrant: "Star", margin: "71%", popularity: "High", action: "Keep prominent on carousel; high contributor." },
    { name: "Bistro Chicken Wings", quadrant: "Star", margin: "68%", popularity: "High", action: "Ideal add-on for high-ticket evening orders." },
    { name: "Classic Arabian Blend", quadrant: "Puzzle", margin: "82%", popularity: "Medium", action: "Bundle with spicy grills to unlock +₦3k attach." },
    { name: "Double Root (1L)", quadrant: "Puzzle", margin: "78%", popularity: "Medium", action: "Feature in wellness weekend campaigns." },
    { name: "Rich Egusi Soup", quadrant: "Plowhorse", margin: "46%", popularity: "High", action: "Consider slight portion realignment or combo." },
    { name: "Date Powder", quadrant: "Dog/Niche", margin: "60%", popularity: "Low", action: "Target health-conscious customers via promos." }
  ];

  return (
    <div className="space-y-6 text-xs text-stone-800">
      
      {/* 1. Executive Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bistro-50 border border-bistro-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-bistro-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Gross Margin</span>
            <ArrowUpRight size={13} className="text-bistro-600" />
          </div>
          <p className="text-xl font-black text-bistro-950">68.4%</p>
          <span className="text-[9px] text-bistro-700 font-semibold">+3.2% vs target</span>
        </div>

        <div className="bg-caramel-50 border border-caramel-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-caramel-800 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>AOV Basket</span>
            <Target size={13} className="text-caramel-600" />
          </div>
          <p className="text-xl font-black text-caramel-950">₦{analytics.averageOrderValue.toLocaleString()}</p>
          <span className="text-[9px] text-caramel-700 font-semibold">₦12.5k target</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-stone-600 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Food Cost Ratio</span>
            <BarChart size={13} />
          </div>
          <p className="text-xl font-black text-stone-900">31.6%</p>
          <span className="text-[9px] text-green-600 font-semibold">Optimal for SMB</span>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-stone-600 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>Drink Attach</span>
            <Zap size={13} className="text-amber-500" />
          </div>
          <p className="text-xl font-black text-stone-900">44.8%</p>
          <span className="text-[9px] text-stone-500 font-semibold">+8% with Arabian Tea</span>
        </div>
      </div>

      {/* 2. Menu Engineering Matrix (BCG Restaurant Quadrants) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-bistro-700" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900">
              Menu Engineering & Profit Matrix
            </h4>
          </div>
          <span className="text-[10px] bg-bistro-100 text-bistro-800 px-2 py-0.5 rounded font-bold">
            BCG Analysis
          </span>
        </div>

        <div className="space-y-2">
          {menuMatrix.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  item.quadrant === 'Star' ? 'bg-amber-100 text-amber-900' :
                  item.quadrant === 'Puzzle' ? 'bg-blue-100 text-blue-900' :
                  item.quadrant === 'Plowhorse' ? 'bg-green-100 text-green-900' :
                  'bg-stone-200 text-stone-700'
                }`}>
                  {item.quadrant}
                </span>
                <span className="font-bold text-stone-900">{item.name}</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-stone-500">
                <span>Margin: <strong className="text-stone-800">{item.margin}</strong></span>
                <span>Demand: <strong className="text-stone-800">{item.popularity}</strong></span>
                <span className="text-[10px] text-stone-600 italic bg-white px-2 py-0.5 rounded border border-stone-200">
                  {item.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Daypart Demand Curve & Heatmap */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-caramel-600" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900">
              Daypart Demand Distribution
            </h4>
          </div>
          <span className="text-[10px] text-stone-400">Peak Order Windows</span>
        </div>

        <div className="space-y-3">
          {[
            { window: "Lunch Rush (11:30 - 14:30)", share: "34%", color: "bg-caramel-500", detail: "Dominant Jollof & Basmati orders" },
            { window: "Afternoon Tea & Snacks (15:00 - 17:00)", share: "18%", color: "bg-bistro-500", detail: "Puff Puff, Arabian Tea, Shawarma" },
            { window: "Dinner Hearth (18:00 - 21:30)", share: "41%", color: "bg-stone-900", detail: "Isi-Ewu, Full Chicken, Assorted Meats" },
            { window: "Late Bites (21:30 - 23:00)", share: "7%", color: "bg-stone-400", detail: "Chicken Shawarma & Pepper Soup" }
          ].map((d, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold text-stone-800">{d.window}</span>
                <span className="font-black text-stone-900">{d.share}</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                <div className={`${d.color} h-full rounded-full transition-all duration-500`} style={{ width: d.share }}></div>
              </div>
              <span className="text-[9px] text-stone-400">{d.detail}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Actionable Business Analyst Recommendations */}
      <div className="bg-bistro-900 text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-bistro-300">
          <Lightbulb size={16} />
          <h4 className="font-bold text-xs uppercase tracking-wider">
            Analyst Growth Directives for Jay's Bistro
          </h4>
        </div>

        <div className="space-y-2 text-[11px] text-bistro-100/90 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-bistro-400 mt-0.5 flex-shrink-0" />
            <p><strong>Sub-Hero Beverage Conversion:</strong> Placing Classic Arabian Blend and Double Root in the dual spotlight capitalizes on high-margin (78-82%) impulse orders alongside meals.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-bistro-400 mt-0.5 flex-shrink-0" />
            <p><strong>Main Hero Velocity:</strong> Chicken Shawarma and Bistro Wings featured at the top carousel directly target the 18:00–21:30 dinner surge, maximizing order completion speed.</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-bistro-400 mt-0.5 flex-shrink-0" />
            <p><strong>WhatsApp Checkout Optimization:</strong> The current average basket contains 3.2 items. Automated drink suggestions in AI Concierge can lift AOV by an estimated ₦2,200 per order.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BusinessInsightsView;