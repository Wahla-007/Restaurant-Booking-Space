import { useMemo } from "react";
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Legend,
} from "recharts";
import { Calendar } from "lucide-react";
import {
 format,
 subDays,
 startOfDay,
 isSameDay,
 subWeeks,
 startOfWeek,
 isSameWeek,
 subMonths,
 startOfMonth,
 isSameMonth,
} from "date-fns";

const DashboardChart = ({ data = [], timeRange, onTimeRangeChange }) => {
 const chartData = useMemo(() => {
  if (!data || data.length === 0) return [];

  const now = new Date();
  let processedData = [];
  let daysToProcess = 7;
  let formatStr = "EEE"; // Day name (Mon, Tue)

  // Determine range and format
  if (timeRange === "daily") {
   daysToProcess = 7;
   formatStr = "EEE"; // Mon

   // Generate last 7 days buckets
   for (let i = daysToProcess - 1; i >= 0; i--) {
    const date = subDays(now, i);
    processedData.push({
     date: date,
     name: format(date, formatStr),
     fullDate: format(date, "MMM dd, yyyy"),
     total: 0,
     completed: 0,
     cancelled: 0,
    });
   }

   // Fill buckets
   data.forEach((booking) => {
    const bookingDate = new Date(booking.date);
    const dayBucket = processedData.find((d) => isSameDay(d.date, bookingDate));

    if (dayBucket) {
     dayBucket.total += 1;
     if (booking.status === "completed") dayBucket.completed += 1;
     if (booking.status === "cancelled") dayBucket.cancelled += 1;
    }
   });
  } else if (timeRange === "weekly") {
   // Last 4 weeks
   for (let i = 3; i >= 0; i--) {
    const date = subWeeks(now, i);
    processedData.push({
     date: date,
     name: `Week ${format(date, "w")}`,
     fullDate: `Week of ${format(startOfWeek(date), "MMM dd")}`,
     total: 0,
     completed: 0,
     cancelled: 0,
    });
   }

   data.forEach((booking) => {
    const bookingDate = new Date(booking.date);
    const weekBucket = processedData.find((d) =>
     isSameWeek(d.date, bookingDate),
    );

    if (weekBucket) {
     weekBucket.total += 1;
     if (booking.status === "completed") weekBucket.completed += 1;
     if (booking.status === "cancelled") weekBucket.cancelled += 1;
    }
   });
  } else if (timeRange === "monthly") {
   // Last 6 months
   for (let i = 5; i >= 0; i--) {
    const date = subMonths(now, i);
    processedData.push({
     date: date,
     name: format(date, "MMM"),
     fullDate: format(date, "MMMM yyyy"),
     total: 0,
     completed: 0,
     cancelled: 0,
    });
   }

   data.forEach((booking) => {
    const bookingDate = new Date(booking.date);
    const monthBucket = processedData.find((d) =>
     isSameMonth(d.date, bookingDate),
    );

    if (monthBucket) {
     monthBucket.total += 1;
     if (booking.status === "completed") monthBucket.completed += 1;
     if (booking.status === "cancelled") monthBucket.cancelled += 1;
    }
   });
  } else {
   // Custom or default fall back to daily logic if nothing selected
   daysToProcess = 7;
   for (let i = daysToProcess - 1; i >= 0; i--) {
    const date = subDays(now, i);
    processedData.push({
     date: date,
     name: format(date, formatStr),
     fullDate: format(date, "MMM dd, yyyy"),
     total: 0,
     completed: 0,
     cancelled: 0,
    });
   }
   data.forEach((booking) => {
    const bookingDate = new Date(booking.date);
    const dayBucket = processedData.find((d) => isSameDay(d.date, bookingDate));
    if (dayBucket) {
     dayBucket.total += 1;
     if (booking.status === "completed") dayBucket.completed += 1;
     if (booking.status === "cancelled") dayBucket.cancelled += 1;
    }
   });
  }

  return processedData;
 }, [data, timeRange]);

 const timeFilters = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom", value: "custom" },
 ];

 return (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div>
     <h3 className="text-lg font-bold text-slate-800">Analytics Overview</h3>
     <p className="text-sm text-slate-500">
      Track your restaurant's performance
     </p>
    </div>

    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
     {timeFilters.map((filter) => (
      <button
       key={filter.value}
       onClick={() => onTimeRangeChange(filter.value)}
       className={`
                px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                ${
                 timeRange === filter.value
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}>
       {filter.label}
      </button>
     ))}
     {timeRange === "custom" && (
      <button className="ml-2 p-1.5 text-slate-500 hover:text-emerald-600">
       <Calendar className="w-4 h-4" />
      </button>
     )}
    </div>
   </div>

   <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
     <AreaChart
      data={chartData}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
      <defs>
       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
       </linearGradient>
       <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
       </linearGradient>
       <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
       </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis
       dataKey="name"
       axisLine={false}
       tickLine={false}
       tick={{ fill: "#64748b", fontSize: 12 }}
       dy={10}
      />
      <YAxis
       axisLine={false}
       tickLine={false}
       tick={{ fill: "#64748b", fontSize: 12 }}
       allowDecimals={false}
      />
      <Tooltip
       contentStyle={{
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
       }}
       labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
      />
      <Legend wrapperStyle={{ paddingTop: "20px" }} />

      <Area
       type="linear"
       dataKey="total"
       name="Total Bookings"
       stroke="#3b82f6"
       strokeWidth={2}
       fillOpacity={1}
       fill="url(#colorTotal)"
       dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
       activeDot={{ r: 5 }}
      />
      <Area
       type="linear"
       dataKey="completed"
       name="Completed"
       stroke="#10b981"
       strokeWidth={2}
       fillOpacity={1}
       fill="url(#colorCompleted)"
       dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
       activeDot={{ r: 5 }}
      />
      <Area
       type="linear"
       dataKey="cancelled"
       name="Cancelled"
       stroke="#f43f5e"
       strokeWidth={2}
       fillOpacity={1}
       fill="url(#colorCancelled)"
       dot={{ r: 3, fill: "#f43f5e", strokeWidth: 0 }}
       activeDot={{ r: 5 }}
      />
     </AreaChart>
    </ResponsiveContainer>
   </div>
  </div>
 );
};

export default DashboardChart;
