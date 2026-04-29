interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: 'peach' | 'mint' | 'lilac' | 'straw';
}

const colorClasses = {
  peach: 'bg-peach-50 border-peach-200 text-peach-700',
  mint: 'bg-mint-50 border-mint-200 text-mint-700',
  lilac: 'bg-lilac-50 border-lilac-200 text-lilac-700',
  straw: 'bg-straw-50 border-straw-200 text-straw-700',
};

export default function MetricsCard({ title, value, icon, color }: Props) {
  return (
    <div className={`bg-ivory-50 border border-beige-200 rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${colorClasses[color]}`}>
          {title}
        </span>
      </div>
      <p className="text-3xl font-bold text-earth-800">{value}</p>
    </div>
  );
}
