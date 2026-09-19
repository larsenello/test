import { useState, useEffect } from 'react';

// Types
interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon: string;
}

interface Asset {
  id: number;
  name: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

interface Liability {
  id: number;
  name: string;
  amount: number;
  monthlyPayment: number;
  progress: number;
  icon: string;
}

// Data
const recentTransactions: Transaction[] = [
  { id: 1, title: 'Зарплата', amount: 185000, type: 'income', category: 'Работа', date: 'Сегодня', icon: '💰' },
  { id: 2, title: 'Аренда', amount: -45000, type: 'expense', category: 'Жильё', date: 'Сегодня', icon: '🏠' },
  { id: 3, title: 'Фриланс', amount: 35000, type: 'income', category: 'Подработка', date: 'Вчера', icon: '💻' },
  { id: 4, title: 'Продукты', amount: -8500, type: 'expense', category: 'Еда', date: 'Вчера', icon: '🛒' },
  { id: 5, title: 'Подписка', amount: -990, type: 'expense', category: 'Развлечения', date: '2 дня', icon: '🎬' },
  { id: 6, title: 'Дивиденды', amount: 12000, type: 'income', category: 'Инвестиции', date: '3 дня', icon: '📈' },
];

const assets: Asset[] = [
  { id: 1, name: 'Наличные', value: 285000, change: 0, icon: '💵', color: '#00e676' },
  { id: 2, name: 'Банковский счёт', value: 520000, change: 2.3, icon: '🏦', color: '#448aff' },
  { id: 3, name: 'Инвестиции', value: 890000, change: 5.7, icon: '📊', color: '#7c4dff' },
  { id: 4, name: 'Криптовалюта', value: 340000, change: -3.2, icon: '₿', color: '#ffd740' },
  { id: 5, name: 'Недвижимость', value: 5000000, change: 1.1, icon: '🏢', color: '#ff6e40' },
];

const liabilities: Liability[] = [
  { id: 1, name: 'Ипотека', amount: 3200000, monthlyPayment: 42000, progress: 35, icon: '🏠' },
  { id: 2, name: 'Автокредит', amount: 850000, monthlyPayment: 28000, progress: 62, icon: '🚗' },
  { id: 3, name: 'Кредитная карта', amount: 125000, monthlyPayment: 15000, progress: 78, icon: '💳' },
];

// Helper functions
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU').format(Math.abs(amount));
};

// Components
function BalanceCard() {
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const balance = totalAssets - totalLiabilities;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = balance / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= balance) {
        setAnimatedBalance(balance);
        clearInterval(timer);
      } else {
        setAnimatedBalance(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [balance]);

  const monthIncome = recentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = recentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 animate-fade-in-up animate-pulse-glow"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00e676, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c4dff, transparent)' }} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}>
            <span className="text-sm">⏱</span>
          </div>
          <span className="text-sm font-medium text-gray-400">TimeFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">● Онлайн</span>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">• • Баланс • •</p>
        <h1 className="text-4xl font-bold animate-count-up"
          style={{ background: 'linear-gradient(90deg, #ffffff, #e0e0e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {formatMoney(animatedBalance)} ₽
        </h1>
      </div>

      {/* Income/Expense summary */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-sm">↑</span>
            <span className="text-xs text-gray-400">Доходы</span>
          </div>
          <p className="text-lg font-semibold text-green-400">+{formatMoney(monthIncome)} ₽</p>
        </div>
        <div className="flex-1 rounded-2xl p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-sm">↓</span>
            <span className="text-xs text-gray-400">Расходы</span>
          </div>
          <p className="text-lg font-semibold text-red-400">-{formatMoney(monthExpense)} ₽</p>
        </div>
      </div>
    </div>
  );
}

function StatsCards() {
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const savingsRate = Math.round(((totalAssets - totalLiabilities) / totalAssets) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/10">
            <span>📈</span>
          </div>
          <span className="text-xs text-gray-400">Активы</span>
        </div>
        <p className="text-lg font-bold text-green-400">{formatMoney(totalAssets)} ₽</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10">
            <span>📉</span>
          </div>
          <span className="text-xs text-gray-400">Пассивы</span>
        </div>
        <p className="text-lg font-bold text-red-400">{formatMoney(totalLiabilities)} ₽</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10">
            <span>💎</span>
          </div>
          <span className="text-xs text-gray-400">Чистая стоимость</span>
        </div>
        <p className="text-lg font-bold text-blue-400">{formatMoney(totalAssets - totalLiabilities)} ₽</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-500/10">
            <span>🎯</span>
          </div>
          <span className="text-xs text-gray-400">Норма сбережений</span>
        </div>
        <p className="text-lg font-bold text-purple-400">{savingsRate}%</p>
      </div>
    </div>
  );
}

function AssetsSection() {
  const [expanded, setExpanded] = useState(false);
  const displayAssets = expanded ? assets : assets.slice(0, 3);
  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="animate-fade-in-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Активы
        </h2>
        <span className="text-sm text-gray-400">{formatMoney(totalAssets)} ₽</span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {displayAssets.map((asset, index) => (
          <div key={asset.id}
            className={`flex items-center justify-between p-4 ${index !== displayAssets.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${asset.color}15` }}>
                {asset.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{asset.name}</p>
                <div className="flex items-center gap-1">
                  {asset.change > 0 ? (
                    <span className="text-xs text-green-400">↑ {asset.change}%</span>
                  ) : asset.change < 0 ? (
                    <span className="text-xs text-red-400">↓ {Math.abs(asset.change)}%</span>
                  ) : (
                    <span className="text-xs text-gray-400">— 0%</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{formatMoney(asset.value)} ₽</p>
              <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full progress-fill"
                  style={{ width: `${(asset.value / totalAssets) * 100}%`, backgroundColor: asset.color }} />
              </div>
            </div>
          </div>
        ))}
        {assets.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-3 text-center text-sm text-gray-400 hover:text-white transition-colors border-t border-white/5"
          >
            {expanded ? 'Свернуть ↑' : `Ещё ${assets.length - 3} активов ↓`}
          </button>
        )}
      </div>
    </div>
  );
}

function LiabilitiesSection() {
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          Пассивы
        </h2>
        <span className="text-sm text-gray-400">{formatMoney(totalLiabilities)} ₽</span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {liabilities.map((liability, index) => (
          <div key={liability.id}
            className={`p-4 ${index !== liabilities.length - 1 ? 'border-b border-white/5' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-red-500/10">
                  {liability.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{liability.name}</p>
                  <p className="text-xs text-gray-400">{formatMoney(liability.monthlyPayment)} ₽/мес</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-red-400">{formatMoney(liability.amount)} ₽</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full progress-fill"
                  style={{ width: `${liability.progress}%`, background: 'linear-gradient(90deg, #ff5252, #ff8a80)' }} />
              </div>
              <span className="text-xs text-gray-400 w-10 text-right">{liability.progress}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Погашено {liability.progress}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsSection() {
  return (
    <div className="animate-fade-in-up delay-500" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Последние операции
        </h2>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Все →</button>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {recentTransactions.map((transaction, index) => (
          <div key={transaction.id}
            className={`flex items-center justify-between p-4 ${index !== recentTransactions.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: transaction.type === 'income' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 82, 82, 0.1)' }}>
                {transaction.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.title}</p>
                <p className="text-xs text-gray-400">{transaction.category} • {transaction.date}</p>
              </div>
            </div>
            <p className={`font-semibold text-sm ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)} ₽
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomNav() {
  const [active, setActive] = useState('home');
  
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Главная' },
    { id: 'stats', icon: '📊', label: 'Статистика' },
    { id: 'add', icon: '➕', label: 'Добавить' },
    { id: 'goals', icon: '🎯', label: 'Цели' },
    { id: 'profile', icon: '👤', label: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/5 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              active === item.id ? 'bg-white/10 scale-105' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className={`text-[10px] ${active === item.id ? 'text-white' : 'text-gray-400'}`}>
              {item.label}
            </span>
            {active === item.id && (
              <div className="w-1 h-1 rounded-full bg-green-400 mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm font-bold">
          TF
        </div>
        <div>
          <p className="text-xs text-gray-400">Добро пожаловать 👋</p>
          <p className="font-semibold text-sm">Александр</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="text-sm">🔔</span>
        </button>
        <button className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <span className="text-sm">⚙️</span>
        </button>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: '↗️', label: 'Перевод', color: 'from-blue-500/20 to-blue-600/20' },
    { icon: '💳', label: 'Оплата', color: 'from-purple-500/20 to-purple-600/20' },
    { icon: '📥', label: 'Пополнить', color: 'from-green-500/20 to-green-600/20' },
    { icon: '📊', label: 'Аналитика', color: 'from-orange-500/20 to-orange-600/20' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 animate-fade-in-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      {actions.map((action) => (
        <button key={action.label}
          className={`flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br ${action.color} border border-white/5 hover:border-white/20 transition-all hover:scale-105`}>
          <span className="text-xl">{action.icon}</span>
          <span className="text-[10px] text-gray-300">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Status bar mock */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs text-gray-500">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">📶</span>
            <span className="text-xs text-gray-500">🔋 87%</span>
          </div>
        </div>

        <Header />
        
        <div className="space-y-5">
          <BalanceCard />
          <QuickActions />
          <StatsCards />
          <AssetsSection />
          <LiabilitiesSection />
          <TransactionsSection />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
