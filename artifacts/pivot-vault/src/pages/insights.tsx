import { 
  useGetInsightsSummary, 
  useGetFailureReasons, 
  useGetIndustryDistribution, 
  useGetFailuresByYear 
} from "@workspace/api-client-react";
import { formatNumber } from "@/lib/format";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";

const COLORS = ['#171717', '#4d4d4d', '#888888', '#c4c4c4', '#e5e5e5'];

export default function Insights() {
  const { data: summary } = useGetInsightsSummary();
  const { data: failureReasons } = useGetFailureReasons();
  const { data: industryDist } = useGetIndustryDistribution();
  const { data: yearDist } = useGetFailuresByYear();

  return (
    <main className="min-h-screen bg-[#fafafa] font-sans pb-24">
      <header className="w-full bg-white px-6 py-16 border-b border-[#ebebeb]">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-semibold text-4xl text-[#171717] tracking-[-1.28px] mb-4">
            Failure patterns across industries.
          </h1>
          <p className="text-lg text-[#4d4d4d] max-w-2xl">
            A macro view of startup death. Based on verified postmortems from our community.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb]">
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Total Autopsies</div>
            <div className="font-sans font-semibold text-4xl text-[#171717]">
              {formatNumber(summary?.totalPostmortems)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb]">
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Industries Affected</div>
            <div className="font-sans font-semibold text-4xl text-[#171717]">
              {formatNumber(summary?.totalIndustries)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb]">
            <div className="font-mono text-xs text-[#888888] uppercase tracking-wider mb-2">Leading Cause</div>
            <div className="font-sans font-semibold text-2xl text-[#171717] mt-1 h-9 flex items-center">
              {summary?.topFailureCause || "—"}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Failure Reasons */}
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb]">
            <h2 className="font-sans font-semibold text-xl text-[#171717] mb-6">Top Failure Reasons</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureReasons} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ebebeb" />
                  <XAxis type="number" tick={{ fill: '#888888', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="reason" type="category" width={120} tick={{ fill: '#4d4d4d', fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#fafafa' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #ebebeb', boxShadow: 'var(--shadow-float)' }}
                    itemStyle={{ color: '#171717', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#171717" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Industry Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb]">
            <h2 className="font-sans font-semibold text-xl text-[#171717] mb-6">Industry Distribution</h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="industry"
                    stroke="none"
                  >
                    {industryDist?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #ebebeb', boxShadow: 'var(--shadow-float)' }}
                    itemStyle={{ color: '#171717', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Failures by Year */}
          <div className="bg-white p-6 rounded-lg shadow-[var(--shadow-card)] border border-[#ebebeb] lg:col-span-2">
            <h2 className="font-sans font-semibold text-xl text-[#171717] mb-6">Shutdowns by Year</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearDist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
                  <XAxis dataKey="year" tick={{ fill: '#888888', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                  <YAxis tick={{ fill: '#888888', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #ebebeb', boxShadow: 'var(--shadow-float)' }}
                    itemStyle={{ color: '#171717', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#171717" strokeWidth={3} dot={{ r: 4, fill: '#171717' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
