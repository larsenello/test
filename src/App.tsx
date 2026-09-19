import { useState, useEffect } from 'react';
import InitWizard, { isInitialized, getStoredData, resetApp } from './components/InitWizard';

// Types
interface InitData {
  name: string;
  currency: string;
  initialBalance: number;
  assets: { name: string; value: number; icon: string }[];
  liabilities: { name: string; amount: number; monthlyPayment: number; icon: string }[];
  monthlyIncome: number;
  monthlyExpense: number;
}

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  icon: string;
}

// Helper
const formatMoney = (amount: number, currency: string = '₽'): string => {
  return `${new Intl.NumberFormat('ru-RU').format(Math.abs(amount))} ${currency}`;
};

// Demo transactions
const recentTransactions: Transaction[] = [
  { id: 1, title: 'Зарплата', amount: 185000, type: 'income', category: 'Работа', date: 'Сегодня', icon: '💰' },
  { id: 2, title: 'Аренда', amount: -45000, type: 'expense', category: 'Жильё', date: 'Сегодня', icon: '🏠' },
  { id: 3, title: 'Фриланс', amount: 35000, type: 'income', category: 'Подработка', date: 'Вчера', icon: '💻' },
  { id: 4, title: 'Продукты', amount: -8500, type: 'expense', category: 'Еда', date: 'Вчера', icon: '🛒' },
  { id: 5, title: 'Подписка', amount: -990, type: 'expense', category: 'Развлечения', date: '2 дня', icon: '🎬' },
  { id: 6, title: 'Дивиденды', amount: 12000, type: 'income', category: 'Инвестиции', date: '3 дня', icon: '📈' },
];

export default function App() {
  const [initialized, setInitialized] = useState(isInitialized());
  const [data, setData] = useState<InitData>(getStoredData());

  const handleInitComplete = (newData: InitData) => {
    setData(newData);
    setInitialized(true);
  };

  if (!initialized) {
    return <InitWizard onComplete={handleInitComplete} />;
  }

  return <Dashboard data={data} onReset={() => { resetApp(); setInitialized(false); }} />;
}

function Dashboard({ data, onReset }: { data: InitData; onReset: () => void }) {
  const totalAssets = data.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = data.liabilities.reduce((s, l) => s + l.amount, 0);
  const balance = totalAssets - totalLiabilities;
  const currency = data.currency;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)' }}>
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs text-gray-500">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">📶</span>
            <span className="text-xs text-gray-500">🔋 87%</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm font-bold">
              {data.name ? data.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <p className="text-xs text-gray-400">Добро пожаловать 👋</p>
              <p className="font-semibold text-sm">{data.name || 'Пользователь'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="text-sm">🔔</span>
            </button>
            <button
              onClick={onReset}
              title="Сбросить данные"
              className="w-9 h-9 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="text-sm">⚙️</span>
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <BalanceCard balance={balance} currency={currency} income={data.monthlyIncome} expense={data.monthlyExpense} />
          <QuickActions />
          <StatsCards totalAssets={totalAssets} totalLiabilities={totalLiabilities} currency={currency} />
          <AssetsSection assets={data.assets} totalAssets={totalAssets} currency={currency} />
          <LiabilitiesSection liabilities={data.liabilities} totalLiabilities={totalLiabilities} currency={currency} />
          <TransactionsSection currency={currency} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function BalanceCard({ balance, currency, income, expense }: { balance: number; currency: string; income: number; expense: number }) {
  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = balance / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= balance) || (increment < 0 && current <= balance) || increment === 0) {
        setAnimatedBalance(balance);
        clearInterval(timer);
      } else {
        setAnimatedBalance(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [balance]);

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 animate-fade-in-up animate-pulse-glow"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #00e676, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #7c4dff, transparent)' }} />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}>
            <span className="text-sm">⏱</span>
          </div>
          <span className="text-sm font-medium text-gray-400">TimeFlow</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">● Онлайн</span>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">• • Баланс • •</p>
        <h1 className="text-4xl font-bold animate-count-up"
          style={{ background: 'linear-gradient(90deg, #ffffff, #e0e0e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {formatMoney(animatedBalance, currency)}
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-2xl p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-sm">↑</span>
            <span className="text-xs text-gray-400">Доходы</span>
          </div>
          <p className="text-lg font-semibold text-green-400">+{formatMoney(income, currency)}</p>
        </div>
        <div className="flex-1 rounded-2xl p-3 bg-white/5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-sm">↓</span>
            <span className="text-xs text-gray-400">Расходы</span>
          </div>
          <p className="text-lg font-semibold text-red-400">-{formatMoney(expense, currency)}</p>
        </div>
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

function StatsCards({ totalAssets, totalLiabilities, currency }: { totalAssets: number; totalLiabilities: number; currency: string }) {
  const savingsRate = totalAssets > 0 ? Math.round(((totalAssets - totalLiabilities) / totalAssets) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 animate-fade-in-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/10">
            <span>📈</span>
          </div>
          <span className="text-xs text-gray-400">Активы</span>
        </div>
        <p className="text-lg font-bold text-green-400">{formatMoney(totalAssets, currency)}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-500/10">
            <span>📉</span>
          </div>
          <span className="text-xs text-gray-400">Пассивы</span>
        </div>
        <p className="text-lg font-bold text-red-400">{formatMoney(totalLiabilities, currency)}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10">
            <span>💎</span>
          </div>
          <span className="text-xs text-gray-400">Чистая стоимость</span>
        </div>
        <p className="text-lg font-bold text-blue-400">{formatMoney(totalAssets - totalLiabilities, currency)}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-500/10">
            <span>🎯</span>
          </div>
          <span className="text-xs text-gray-400">Сбережения</span>
        </div>
        <p className="text-lg font-bold text-purple-400">{savingsRate}%</p>
      </div>
    </div>
  );
}

function AssetsSection({ assets, totalAssets, currency }: { assets: InitData['assets']; totalAssets: number; currency: string }) {
  const [expanded, setExpanded] = useState(false);
  const displayAssets = expanded ? assets : assets.slice(0, 3);
  const colors = ['#00e676', '#448aff', '#7c4dff', '#ffd740', '#ff6e40', '#26c6da', '#ab47bc', '#ef5350'];

  if (assets.length === 0) {
    return (
      <div className="animate-fade-in-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Активы
          </h2>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">Нет активов. Добавьте через настройки ⚙️</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Активы
        </h2>
        <span className="text-sm text-gray-400">{formatMoney(totalAssets, currency)}</span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {displayAssets.map((asset, index) => (
          <div key={asset.name}
            className={`flex items-center justify-between p-4 ${index !== displayAssets.length - 1 ? 'border-b border-white/5' : ''} hover:bg-white/5 transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${colors[index % colors.length]}15` }}>
                {asset.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{asset.name}</p>
                <p className="text-xs text-gray-500">{totalAssets > 0 ? Math.round((asset.value / totalAssets) * 100) : 0}% портфеля</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{formatMoney(asset.value, currency)}</p>
              <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full progress-fill"
                  style={{ width: `${totalAssets > 0 ? (asset.value / totalAssets) * 100 : 0}%`, backgroundColor: colors[index % colors.length] }} />
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

function LiabilitiesSection({ liabilities, totalLiabilities, currency }: { liabilities: InitData['liabilities']; totalLiabilities: number; currency: string }) {
  if (liabilities.length === 0) {
    return (
      <div className="animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            Пассивы
          </h2>
        </div>
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-gray-500 text-sm">Нет пассивов 🎉</p>
          <p className="text-gray-600 text-xs mt-1">Отличный финансовый результат!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          Пассивы
        </h2>
        <span className="text-sm text-gray-400">{formatMoney(totalLiabilities, currency)}</span>
      </div>
      <div className="glass-card rounded-2xl overflow-hidden">
        {liabilities.map((liability, index) => {
          const progress = liability.monthlyPayment > 0 ? Math.min(95, Math.round((liability.monthlyPayment * 12 * 3) / liability.amount * 100)) : 0;
          return (
            <div key={liability.name}
              className={`p-4 ${index !== liabilities.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-red-500/10">
                    {liability.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{liability.name}</p>
                    <p className="text-xs text-gray-400">{formatMoney(liability.monthlyPayment, currency)}/мес</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-red-400">{formatMoney(liability.amount, currency)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full progress-fill"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #ff5252, #ff8a80)' }} />
                </div>
                <span className="text-xs text-gray-400 w-10 text-right">{progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransactionsSection({ currency }: { currency: string }) {
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
              {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount, currency)}
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
            <span className={`text-[10px] ${active === item.id ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
            {active === item.id && <div className="w-1 h-1 rounded-full bg-green-400 mt-0.5" />}
          </button>
        ))}
      </div>
    </div>
  );
}
