import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../supabase";
import {
 AreaChart,
 Area,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
 PieChart,
 Pie,
 Cell,
} from "recharts";
import {
 Eye,
 CircleCheckBig,
 TrendingUp,
 BarChart3,
 Calendar,
 ArrowUpRight,
 ArrowDownRight,
 Layers,
} from "lucide-react";
import {
 format,
 subDays,
 subWeeks,
 subMonths,
 startOfDay,
 startOfWeek,
 startOfMonth,
 isSameDay,
 isSameWeek,
 isSameMonth,
 parseISO,
} from "date-fns";

const COLORS = {
 impression: "#6366f1",
 view: "#10b981",
 conversion: "#f59e0b",
};

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

export default function TrafficAnalytics({ restaurantId }) {
 const [events, setEvents] = useState([]);
 const [loading, setLoading] = useState(true);
 const [timeRange, setTimeRange] = useState("7d");

 useEffect(() => {
  if (!restaurantId) return;
  fetchAnalytics();
 }, [restaurantId]);

 const fetchAnalytics = async () => {
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("restaurant_analytics")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });

   if (error) throw error;
   setEvents(data || []);
  } catch (err) {
   console.error("Error fetching analytics:", err);
  } finally {
   setLoading(false);
  }
 };

 // Compute date range filter
 const filteredEvents = useMemo(() => {
  const now = new Date();
  let cutoff;
  switch (timeRange) {
   case "7d":
    cutoff = subDays(now, 7);
    break;
   case "30d":
    cutoff = subDays(now, 30);
    break;
   case "90d":
    cutoff = subDays(now, 90);
    break;
   default:
    cutoff = subDays(now, 7);
  }
  return events.filter((e) => new Date(e.created_at) >= cutoff);
 }, [events, timeRange]);

 // Totals
 const totals = useMemo(() => {
  const imp = filteredEvents.filter(
   (e) => e.event_type === "impression",
  ).length;
  const view = filteredEvents.filter((e) => e.event_type === "view").length;
  const click = filteredEvents.filter((e) => e.event_type === "click").length;
  return { impression: imp, view, click };
 }, [filteredEvents]);

 // Previous period totals for comparison
 const prevTotals = useMemo(() => {
  const now = new Date();
  let cutoff, prevCutoff;
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  cutoff = subDays(now, days);
  prevCutoff = subDays(now, days * 2);

  const prevEvents = events.filter((e) => {
   const d = new Date(e.created_at);
   return d >= prevCutoff && d < cutoff;
  });

  const imp = prevEvents.filter((e) => e.event_type === "impression").length;
  const view = prevEvents.filter((e) => e.event_type === "view").length;
  const click = prevEvents.filter((e) => e.event_type === "click").length;
  return { impression: imp, view, click };
 }, [events, timeRange]);

 // Percentage change
 const pctChange = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
 };

 // Chart data: group by day
 const chartData = useMemo(() => {
  const now = new Date();
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const buckets = [];

  if (days <= 30) {
   // Day-level buckets
   for (let i = days - 1; i >= 0; i--) {
    const date = subDays(now, i);
    buckets.push({
     date,
     label: days <= 7 ? format(date, "EEE") : format(date, "MMM dd"),
     impressions: 0,
     views: 0,
     conversions: 0,
    });
   }

   filteredEvents.forEach((e) => {
    const d = new Date(e.created_at);
    const bucket = buckets.find((b) => isSameDay(b.date, d));
    if (bucket) {
     if (e.event_type === "impression") bucket.impressions++;
     if (e.event_type === "view") bucket.views++;
     if (e.event_type === "click") bucket.conversions++;
    }
   });
  } else {
   // Week-level buckets for 90 days
   for (let i = 12; i >= 0; i--) {
    const date = subWeeks(now, i);
    buckets.push({
     date,
     label: `W${format(date, "w")}`,
     impressions: 0,
     views: 0,
     conversions: 0,
    });
   }

   filteredEvents.forEach((e) => {
    const d = new Date(e.created_at);
    const bucket = buckets.find((b) => isSameWeek(b.date, d));
    if (bucket) {
     if (e.event_type === "impression") bucket.impressions++;
     if (e.event_type === "view") bucket.views++;
     if (e.event_type === "click") bucket.conversions++;
    }
   });
  }

  return buckets;
 }, [filteredEvents, timeRange]);

 // Pie data
 const pieData = useMemo(
  () => [
   { name: "Impressions", value: totals.impression },
   { name: "Views", value: totals.view },
   { name: "Conversions", value: totals.click },
  ],
  [totals],
 );

 // Conversion rates
 const viewRate =
  totals.impression > 0
   ? ((totals.view / totals.impression) * 100).toFixed(1)
   : "0.0";
 const conversionRate =
  totals.view > 0 ? ((totals.click / totals.view) * 100).toFixed(1) : "0.0";

 if (loading) {
  return (
   <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
     <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
     <p className="text-slate-500 text-sm font-medium">
      Loading traffic data...
     </p>
    </div>
   </div>
  );
 }

 const StatCard = ({ icon: Icon, label, value, color, prev }) => {
  const change = pctChange(value, prev);
  const isUp = change >= 0;
  return (
   <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
     <div
      className="p-2.5 rounded-xl"
      style={{ backgroundColor: `${color}15` }}>
      <Icon size={20} style={{ color }} />
     </div>
     {prev > 0 || value > 0 ? (
      <div
       className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
        isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
       }`}>
       {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
       {Math.abs(change)}%
      </div>
     ) : null}
    </div>
    <p className="text-2xl font-bold text-slate-800">
     {value.toLocaleString()}
    </p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
   </div>
  );
 };

 const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
   <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-3 min-w-[160px]">
    <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
    {payload.map((p) => (
     <div
      key={p.name}
      className="flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
       <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: p.color }}
       />
       <span className="text-slate-600 capitalize">{p.name}</span>
      </div>
      <span className="font-semibold text-slate-800">{p.value}</span>
     </div>
    ))}
   </div>
  );
 };

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Traffic & Analytics</h2>
     <p className="text-sm text-slate-500 mt-1">
      Track your restaurant's impressions, views, and engagement
     </p>
    </div>
    <div className="flex gap-2">
     {[
      { key: "7d", label: "7 Days" },
      { key: "30d", label: "30 Days" },
      { key: "90d", label: "90 Days" },
     ].map((r) => (
      <button
       key={r.key}
       onClick={() => setTimeRange(r.key)}
       className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all cursor-pointer ${
        timeRange === r.key
         ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
         : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
       }`}>
       {r.label}
      </button>
     ))}
    </div>
   </div>

   {/* Stat Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
     icon={Layers}
     label="Impressions"
     value={totals.impression}
     color={COLORS.impression}
     prev={prevTotals.impression}
    />
    <StatCard
     icon={Eye}
     label="Page Views"
     value={totals.view}
     color={COLORS.view}
     prev={prevTotals.view}
    />
    <StatCard
     icon={CircleCheckBig}
     label="Conversions"
     value={totals.click}
     color={COLORS.conversion}
     prev={prevTotals.click}
    />
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
     <div className="flex items-center justify-between mb-3">
      <div className="p-2.5 rounded-xl bg-purple-50">
       <TrendingUp size={20} className="text-purple-500" />
      </div>
     </div>
     <div className="space-y-2">
      <div>
       <span className="text-lg font-bold text-slate-800">{viewRate}%</span>
       <span className="text-xs text-slate-500 ml-2">View Rate</span>
      </div>
      <div>
       <span className="text-lg font-bold text-slate-800">
        {conversionRate}%
       </span>
       <span className="text-xs text-slate-500 ml-2">Conv. Rate</span>
      </div>
     </div>
     <p className="text-sm text-slate-500 mt-1">Conversion</p>
    </div>
   </div>

   {/* Main Chart */}
   <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
     <div>
      <h3 className="text-lg font-bold text-slate-800">Traffic Overview</h3>
      <p className="text-sm text-slate-500 mt-0.5">
       Impressions, views, and conversions over time
      </p>
     </div>
     <div className="flex items-center gap-4 text-xs">
      <span className="flex items-center gap-1.5">
       <span
        className="w-3 h-3 rounded-full"
        style={{ background: COLORS.impression }}
       />
       Impressions
      </span>
      <span className="flex items-center gap-1.5">
       <span
        className="w-3 h-3 rounded-full"
        style={{ background: COLORS.view }}
       />
       Views
      </span>
      <span className="flex items-center gap-1.5">
       <span
        className="w-3 h-3 rounded-full"
        style={{ background: COLORS.conversion }}
       />
       Conversions
      </span>
     </div>
    </div>
    <div style={{ width: "100%", height: 320 }}>
     <ResponsiveContainer>
      <AreaChart data={chartData}>
       <defs>
        <linearGradient id="gradImp" x1="0" y1="0" x2="0" y2="1">
         <stop offset="5%" stopColor={COLORS.impression} stopOpacity={0.15} />
         <stop offset="95%" stopColor={COLORS.impression} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gradView" x1="0" y1="0" x2="0" y2="1">
         <stop offset="5%" stopColor={COLORS.view} stopOpacity={0.15} />
         <stop offset="95%" stopColor={COLORS.view} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
         <stop offset="5%" stopColor={COLORS.conversion} stopOpacity={0.15} />
         <stop offset="95%" stopColor={COLORS.conversion} stopOpacity={0} />
        </linearGradient>
       </defs>
       <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
       <XAxis
        dataKey="label"
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
       />
       <YAxis
        tick={{ fill: "#94a3b8", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
        allowDecimals={false}
       />
       <Tooltip content={<CustomTooltip />} />
       <Area
        type="monotone"
        dataKey="impressions"
        stroke={COLORS.impression}
        strokeWidth={2.5}
        fill="url(#gradImp)"
       />
       <Area
        type="monotone"
        dataKey="views"
        stroke={COLORS.view}
        strokeWidth={2.5}
        fill="url(#gradView)"
       />
       <Area
        type="monotone"
        dataKey="conversions"
        stroke={COLORS.conversion}
        strokeWidth={2.5}
        fill="url(#gradConv)"
       />
      </AreaChart>
     </ResponsiveContainer>
    </div>
   </div>

   {/* Bottom Row: Bar Chart + Pie */}
   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Bar Chart */}
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
     <h3 className="text-lg font-bold text-slate-800 mb-1">Daily Breakdown</h3>
     <p className="text-sm text-slate-500 mb-6">
      Compare impressions, views, and conversions side by side
     </p>
     <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
       <BarChart data={chartData} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
         dataKey="label"
         tick={{ fill: "#94a3b8", fontSize: 12 }}
         axisLine={false}
         tickLine={false}
        />
        <YAxis
         tick={{ fill: "#94a3b8", fontSize: 12 }}
         axisLine={false}
         tickLine={false}
         allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
         dataKey="impressions"
         fill={COLORS.impression}
         radius={[4, 4, 0, 0]}
         maxBarSize={20}
        />
        <Bar
         dataKey="views"
         fill={COLORS.view}
         radius={[4, 4, 0, 0]}
         maxBarSize={20}
        />
        <Bar
         dataKey="conversions"
         fill={COLORS.conversion}
         radius={[4, 4, 0, 0]}
         maxBarSize={20}
        />
       </BarChart>
      </ResponsiveContainer>
     </div>
    </div>

    {/* Pie Chart */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
     <h3 className="text-lg font-bold text-slate-800 mb-1">Traffic Split</h3>
     <p className="text-sm text-slate-500 mb-4">Event type distribution</p>
     <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
       <PieChart>
        <Pie
         data={pieData}
         cx="50%"
         cy="50%"
         innerRadius={55}
         outerRadius={85}
         paddingAngle={4}
         dataKey="value"
         strokeWidth={0}>
         {pieData.map((_, i) => (
          <Cell key={i} fill={PIE_COLORS[i]} />
         ))}
        </Pie>
        <Tooltip />
       </PieChart>
      </ResponsiveContainer>
     </div>
     <div className="space-y-2 mt-2">
      {pieData.map((item, i) => (
       <div
        key={item.name}
        className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
         <span
          className="w-3 h-3 rounded-full"
          style={{ background: PIE_COLORS[i] }}
         />
         <span className="text-slate-600">{item.name}</span>
        </div>
        <span className="font-semibold text-slate-800">
         {item.value.toLocaleString()}
        </span>
       </div>
      ))}
     </div>
    </div>
   </div>

   {/* Funnel Summary */}
   <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
    <h3 className="text-lg font-bold text-slate-800 mb-4">Conversion Funnel</h3>
    <div className="flex items-center gap-4">
     {/* Impressions bar */}
     <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
       <span className="text-slate-500">Impressions</span>
       <span className="font-semibold text-slate-800">
        {totals.impression.toLocaleString()}
       </span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
       <div
        className="h-full rounded-full transition-all duration-500"
        style={{
         width: "100%",
         background: COLORS.impression,
        }}
       />
      </div>
     </div>
     <span className="text-slate-300 text-xl">→</span>
     {/* Views bar */}
     <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
       <span className="text-slate-500">Views</span>
       <span className="font-semibold text-slate-800">
        {totals.view.toLocaleString()}
       </span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
       <div
        className="h-full rounded-full transition-all duration-500"
        style={{
         width:
          totals.impression > 0
           ? `${(totals.view / totals.impression) * 100}%`
           : "0%",
         background: COLORS.view,
        }}
       />
      </div>
     </div>
     <span className="text-slate-300 text-xl">→</span>
     {/* Conversions bar */}
     <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
       <span className="text-slate-500">Conversions</span>
       <span className="font-semibold text-slate-800">
        {totals.click.toLocaleString()}
       </span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
       <div
        className="h-full rounded-full transition-all duration-500"
        style={{
         width:
          totals.impression > 0
           ? `${(totals.click / totals.impression) * 100}%`
           : "0%",
         background: COLORS.conversion,
        }}
       />
      </div>
     </div>
    </div>
    <div className="flex items-center gap-4 mt-3">
     <div className="flex-1" />
     <span className="text-xs text-slate-400 font-medium">
      {viewRate}% view rate
     </span>
     <div className="flex-1" />
     <span className="text-xs text-slate-400 font-medium">
      {conversionRate}% conversion rate
     </span>
     <div className="flex-1" />
    </div>
   </div>
  </div>
 );
}
