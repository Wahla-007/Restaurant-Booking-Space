import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const StatsCard = ({
 title,
 value,
 icon: Icon,
 trend,
 trendValue,
 color = "emerald",
 onClick,
 isActive,
}) => {
 const isPositive = trend === "up";

 return (
  <div
   onClick={onClick}
   className={`
     relative bg-white p-6 rounded-2xl border transition-all duration-300 overflow-hidden
     ${
      isActive
       ? `border border-emerald-300 shadow-lg scale-[1.02]`
       : "border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 hover:-translate-y-1"
     }
     ${onClick ? "cursor-pointer" : ""}
   `}>
   {isActive && (
    <div
     className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rotate-12 transform translate-x-8 -translate-y-8 rounded-full`}
    />
   )}

   <div className="relative z-10">
    <div className="flex justify-between items-start mb-4">
     <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
     </div>
     <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
      <Icon className="w-6 h-6" />
     </div>
    </div>

    <div className="flex items-end justify-between">
     {trendValue && (
      <div className="flex items-center gap-2 text-sm mb-1">
       <span
        className={`
             flex items-center font-semibold
             ${isPositive ? "text-emerald-600" : "text-rose-600"}
           `}>
        {isPositive ? (
         <ArrowUpRight className="w-4 h-4 mr-1" />
        ) : (
         <ArrowDownRight className="w-4 h-4 mr-1" />
        )}
        {trendValue}
       </span>
       <span className="text-slate-400">vs last month</span>
      </div>
     )}
    </div>
   </div>
  </div>
 );
};

export default StatsCard;
