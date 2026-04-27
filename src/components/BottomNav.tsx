const tabs = ['Today', 'Focus', 'Log', 'Projects', 'Goals', 'Tracker', 'Insights', 'Settings'] as const;
export type Tab = (typeof tabs)[number];

export function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t px-2 py-2 grid grid-cols-4 gap-1 text-xs">
      {tabs.map((t) => (
        <button key={t} className={`rounded-xl py-2 ${tab === t ? 'bg-pastelBlue font-semibold' : ''}`} onClick={() => setTab(t)}>{t}</button>
      ))}
    </nav>
  );
}
