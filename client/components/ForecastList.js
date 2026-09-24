import { useI18n } from '@/lib/i18n';
import { formatDay, iconUrl, round } from '@/lib/format';

// Daily forecast (up to 7 days) with a temperature range bar scaled across the week.
export default function ForecastList({ days }) {
  const { t, lang } = useI18n();
  const low = Math.min(...days.map((d) => d.min));
  const high = Math.max(...days.map((d) => d.max));
  const span = Math.max(1, high - low);

  return (
    <section className="glass p-5">
      <h2 className="label mb-2">{t('city.forecast', { days: days.length })}</h2>
      <ul className="divide-y divide-tint/10">
        {days.map((day, index) => (
          <li key={day.date} className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3 py-2.5 sm:grid-cols-[7rem_2.5rem_3.5rem_1fr]">
            <span className="text-sm font-medium capitalize">{index === 0 ? t('city.today') : formatDay(day.date, lang)}</span>
            <img src={iconUrl(day.condition.icon)} alt={day.condition.text} title={day.condition.text} width={40} height={40} />
            <span className={`hidden text-xs sm:inline ${day.chanceOfRain >= 50 ? 'text-accent' : 'text-faint'}`}>💧{day.chanceOfRain}%</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right text-subtle">{round(day.min)}°</span>
              <div className="relative h-1.5 flex-1 rounded-full bg-tint/10">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                  style={{
                    left: `${((day.min - low) / span) * 100}%`,
                    right: `${((high - day.max) / span) * 100}%`,
                  }}
                />
              </div>
              <span className="w-8 font-semibold">{round(day.max)}°</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
