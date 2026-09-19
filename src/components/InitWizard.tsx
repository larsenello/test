import { useState, useEffect } from 'react';

interface InitData {
  name: string;
  currency: string;
  initialBalance: number;
  assets: { name: string; value: number; icon: string }[];
  liabilities: { name: string; amount: number; monthlyPayment: number; icon: string }[];
  monthlyIncome: number;
  monthlyExpense: number;
}

const STORAGE_KEY = 'timeflow_initialized';
const DATA_KEY = 'timeflow_data';

const defaultData: InitData = {
  name: '',
  currency: '₽',
  initialBalance: 0,
  assets: [],
  liabilities: [],
  monthlyIncome: 0,
  monthlyExpense: 0,
};

const assetPresets = [
  { name: 'Наличные', icon: '💵' },
  { name: 'Банковский счёт', icon: '🏦' },
  { name: 'Инвестиции', icon: '📊' },
  { name: 'Криптовалюта', icon: '₿' },
  { name: 'Недвижимость', icon: '🏢' },
  { name: 'Депозит', icon: '💰' },
  { name: 'Золото', icon: '🥇' },
  { name: 'Авто', icon: '🚗' },
];

const liabilityPresets = [
  { name: 'Ипотека', icon: '🏠' },
  { name: 'Автокредит', icon: '🚗' },
  { name: 'Кредитная карта', icon: '💳' },
  { name: 'Потреб. кредит', icon: '🏧' },
  { name: 'Займ', icon: '🤝' },
];

const currencyOptions = [
  { code: '₽', label: 'Рубль (RUB)' },
  { code: '$', label: 'Доллар (USD)' },
  { code: '€', label: 'Евро (EUR)' },
  { code: '₸', label: 'Тенге (KZT)' },
  { code: '₴', label: 'Гривна (UAH)' },
];

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function getStoredData(): InitData {
  const raw = localStorage.getItem(DATA_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return defaultData;
    }
  }
  return defaultData;
}

export function resetApp() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DATA_KEY);
}

// Steps
type Step = 'welcome' | 'profile' | 'balance' | 'assets' | 'liabilities' | 'summary';

export default function InitWizard({ onComplete }: { onComplete: (data: InitData) => void }) {
  const [step, setStep] = useState<Step>('welcome');
  const [data, setData] = useState<InitData>({ ...defaultData });

  const steps: Step[] = ['welcome', 'profile', 'balance', 'assets', 'liabilities', 'summary'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  const next = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };
  const prev = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const finish = () => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete(data);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%)' }}>
      {/* Progress bar */}
      {step !== 'welcome' && (
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={prev} className="text-gray-400 hover:text-white text-sm transition-colors">
              ← Назад
            </button>
            <span className="text-xs text-gray-500">Шаг {currentIndex} из {steps.length - 1}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00e676, #448aff)' }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {step === 'welcome' && <WelcomeStep onStart={next} />}
        {step === 'profile' && <ProfileStep data={data} setData={setData} onNext={next} />}
        {step === 'balance' && <BalanceStep data={data} setData={setData} onNext={next} />}
        {step === 'assets' && <AssetsStep data={data} setData={setData} onNext={next} />}
        {step === 'liabilities' && <LiabilitiesStep data={data} setData={setData} onNext={next} />}
        {step === 'summary' && <SummaryStep data={data} onFinish={finish} />}
      </div>
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center animate-fade-in-up">
      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #00e676, #448aff)' }}>
        <span className="text-5xl">⏱</span>
      </div>
      <h1 className="text-3xl font-bold mb-3">TimeFlow</h1>
      <p className="text-gray-400 mb-2 text-lg">Денежный дашборд</p>
      <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
        Контролируйте свои финансы: отслеживайте активы, пассивы, доходы и расходы в одном месте.
      </p>
      <button
        onClick={onStart}
        className="w-full max-w-xs mx-auto py-4 rounded-2xl font-semibold text-lg text-black transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Начать настройку
      </button>
      <p className="text-xs text-gray-600 mt-4">Займёт всего 2 минуты</p>
    </div>
  );
}

function ProfileStep({ data, setData, onNext }: { data: InitData; setData: (d: InitData) => void; onNext: () => void }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Профиль</h2>
      <p className="text-gray-400 mb-6 text-sm">Как к вам обращаться?</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Ваше имя</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Александр"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Валюта</label>
          <div className="grid grid-cols-2 gap-2">
            {currencyOptions.map((c) => (
              <button
                key={c.code}
                onClick={() => setData({ ...data, currency: c.code })}
                className={`px-4 py-3 rounded-xl border transition-all text-sm ${
                  data.currency === c.code
                    ? 'border-green-400/50 bg-green-400/10 text-green-400'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                {c.code} {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!data.name.trim()}
        className="w-full mt-8 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Далее →
      </button>
    </div>
  );
}

function BalanceStep({ data, setData, onNext }: { data: InitData; setData: (d: InitData) => void; onNext: () => void }) {
  const handleNumber = (field: keyof InitData, value: string) => {
    const num = parseInt(value.replace(/\D/g, '')) || 0;
    setData({ ...data, [field]: num });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Доходы и расходы</h2>
      <p className="text-gray-400 mb-6 text-sm">Укажите примерные суммы за месяц</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
            <span className="text-green-400">↑</span> Ежемесячный доход
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.monthlyIncome ? formatInput(data.monthlyIncome) : ''}
              onChange={(e) => handleNumber('monthlyIncome', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{data.currency}</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
            <span className="text-red-400">↓</span> Ежемесячные расходы
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.monthlyExpense ? formatInput(data.monthlyExpense) : ''}
              onChange={(e) => handleNumber('monthlyExpense', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder-gray-600 focus:outline-none focus:border-red-400/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{data.currency}</span>
          </div>
        </div>

        {data.monthlyIncome > 0 && data.monthlyExpense > 0 && (
          <div className="glass-card rounded-xl p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Баланс месяца</span>
              <span className={`font-bold ${data.monthlyIncome - data.monthlyExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.monthlyIncome - data.monthlyExpense >= 0 ? '+' : ''}{formatInput(data.monthlyIncome - data.monthlyExpense)} {data.currency}
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full mt-8 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Далее →
      </button>
    </div>
  );
}

function AssetsStep({ data, setData, onNext }: { data: InitData; setData: (d: InitData) => void; onNext: () => void }) {
  const toggleAsset = (preset: typeof assetPresets[0]) => {
    const exists = data.assets.find(a => a.name === preset.name);
    if (exists) {
      setData({ ...data, assets: data.assets.filter(a => a.name !== preset.name) });
    } else {
      setData({ ...data, assets: [...data.assets, { ...preset, value: 0 }] });
    }
  };

  const updateValue = (name: string, value: number) => {
    setData({
      ...data,
      assets: data.assets.map(a => a.name === name ? { ...a, value } : a)
    });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Активы</h2>
      <p className="text-gray-400 mb-6 text-sm">Выберите типы активов и укажите суммы</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {assetPresets.map((preset) => {
          const isActive = data.assets.some(a => a.name === preset.name);
          return (
            <button
              key={preset.name}
              onClick={() => toggleAsset(preset)}
              className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                isActive
                  ? 'border-green-400/50 bg-green-400/10 text-green-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              {preset.icon} {preset.name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.assets.map((asset) => (
          <div key={asset.name} className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">{asset.icon}</span>
              <span className="text-sm font-medium flex-1">{asset.name}</span>
              <div className="relative">
                <input
                  type="text"
                  value={asset.value ? formatInput(asset.value) : ''}
                  onChange={(e) => updateValue(asset.name, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  placeholder="0"
                  className="w-28 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-right focus:outline-none focus:border-green-400/50"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">{data.currency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.assets.length === 0 && (
        <p className="text-center text-gray-600 text-sm py-8">Выберите хотя бы один тип актива</p>
      )}

      <button
        onClick={onNext}
        className="w-full mt-6 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Далее →
      </button>
    </div>
  );
}

function LiabilitiesStep({ data, setData, onNext }: { data: InitData; setData: (d: InitData) => void; onNext: () => void }) {
  const toggleLiability = (preset: typeof liabilityPresets[0]) => {
    const exists = data.liabilities.find(l => l.name === preset.name);
    if (exists) {
      setData({ ...data, liabilities: data.liabilities.filter(l => l.name !== preset.name) });
    } else {
      setData({ ...data, liabilities: [...data.liabilities, { ...preset, amount: 0, monthlyPayment: 0 }] });
    }
  };

  const updateField = (name: string, field: 'amount' | 'monthlyPayment', value: number) => {
    setData({
      ...data,
      liabilities: data.liabilities.map(l => l.name === name ? { ...l, [field]: value } : l)
    });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Пассивы</h2>
      <p className="text-gray-400 mb-6 text-sm">Есть ли у вас кредиты или долги?</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {liabilityPresets.map((preset) => {
          const isActive = data.liabilities.some(l => l.name === preset.name);
          return (
            <button
              key={preset.name}
              onClick={() => toggleLiability(preset)}
              className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                isActive
                  ? 'border-red-400/50 bg-red-400/10 text-red-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              {preset.icon} {preset.name}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.liabilities.map((liability) => (
          <div key={liability.name} className="glass-card rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">{liability.icon}</span>
              <span className="text-sm font-medium">{liability.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <label className="text-[10px] text-gray-500 block mb-1">Остаток долга</label>
                <input
                  type="text"
                  value={liability.amount ? formatInput(liability.amount) : ''}
                  onChange={(e) => updateField(liability.name, 'amount', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-400/50"
                />
              </div>
              <div className="relative">
                <label className="text-[10px] text-gray-500 block mb-1">Платёж/мес</label>
                <input
                  type="text"
                  value={liability.monthlyPayment ? formatInput(liability.monthlyPayment) : ''}
                  onChange={(e) => updateField(liability.name, 'monthlyPayment', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-400/50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.liabilities.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-2">Нет пассивов? Отлично! 🎉</p>
          <p className="text-gray-600 text-xs">Можете пропустить этот шаг</p>
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full mt-6 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Далее →
      </button>
    </div>
  );
}

function SummaryStep({ data, onFinish }: { data: InitData; onFinish: () => void }) {
  const totalAssets = data.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = data.liabilities.reduce((s, l) => s + l.amount, 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-2">Готово! 🎉</h2>
      <p className="text-gray-400 mb-6 text-sm">Проверьте ваши данные</p>

      <div className="space-y-4">
        {/* Profile */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-sm font-bold">
              {data.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{data.name}</p>
              <p className="text-xs text-gray-400">Валюта: {data.currency}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Активы</p>
            <p className="text-lg font-bold text-green-400">{formatInput(totalAssets)} {data.currency}</p>
          </div>
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Пассивы</p>
            <p className="text-lg font-bold text-red-400">{formatInput(totalLiabilities)} {data.currency}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 gradient-border">
          <p className="text-xs text-gray-400 mb-1">Чистая стоимость</p>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netWorth >= 0 ? '' : '-'}{formatInput(Math.abs(netWorth))} {data.currency}
          </p>
        </div>

        {/* Monthly */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-gray-400 mb-2">Месячный бюджет</p>
          <div className="flex justify-between text-sm">
            <span className="text-green-400">+{formatInput(data.monthlyIncome)} {data.currency}</span>
            <span className="text-red-400">-{formatInput(data.monthlyExpense)} {data.currency}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="w-full mt-8 py-4 rounded-2xl font-semibold text-lg text-black transition-all hover:scale-[1.02] active:scale-95"
        style={{ background: 'linear-gradient(135deg, #00e676, #00c853)' }}
      >
        Запустить TimeFlow 🚀
      </button>
    </div>
  );
}

function formatInput(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}
