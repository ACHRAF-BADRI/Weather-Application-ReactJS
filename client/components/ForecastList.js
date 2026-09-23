import { useI18n } from '@/lib/i18n';
import { formatDay, iconUrl, round } from '@/lib/format';

export default function ForecastList({ forecast }) {
  const { t, lang } = useI18n();
  const days = forecast.forecastday;
  const low = Math.min(...days.map((d) => d.day.mintemp_c));
  const high = Math.max(...days.map((d) => d.day.maxtemp_c));
  const span = Math.max(1, high - low);

  return (
    <section className="glass p-5">
      <h2 className="label mb-2">{t('city.forecast')}</h2>
      <ul className="divide-y divide-tint/10">
        {days.map(({ date, day }) => (
          <li key={date} className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3 py-3 sm:grid-cols-[7rem_2.5rem_4rem_1fr]">
            <span className="text-sm font-medium capitalize">{formatDay(date, lang)}</span>
            <img src={iconUrl(day.condition.icon)} alt={day.condition.text} title={day.condition.text} width={40} height={40} />
            <span className="hidden text-xs text-accent sm:inline">💧{day.daily_chance_of_rain}%</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right text-subtle">{round(day.mintemp_c)}°</span>
              <div className="relative h-1.5 flex-1 rounded-full bg-tint/10">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-300"
                  style={{
                    left: `${((day.mintemp_c - low) / span) * 100}%`,
                    right: `${((high - day.maxtemp_c) / span) * 100}%`,
                  }}
                />
              </div>
              <span className="w-8 font-semibold">{round(day.maxtemp_c)}°</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
