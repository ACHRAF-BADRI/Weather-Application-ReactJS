import { useI18n } from '@/lib/i18n';
import { formatHour, iconUrl, round } from '@/lib/format';

// Next 24 hours starting from the current local hour; scrolls sideways on phones.
export default function HourlyStrip({ location, forecast }) {
  const { t } = useI18n();
  const nowEpoch = location.localtime_epoch - 3600;
  const hours = forecast.forecastday
    .flatMap((day) => day.hour)
    .filter((hour) => hour.time_epoch >= nowEpoch)
    .slice(0, 24);

  return (
    <section className="glass p-5">
      <h2 className="label mb-3">{t('city.hourly')}</h2>
      <ol className="-mx-2 flex snap-x gap-1 overflow-x-auto px-2 pb-2">
        {hours.map((hour, index) => (
          <li key={hour.time_epoch} className="flex min-w-[64px] snap-start flex-col items-center gap-1 rounded-2xl px-2 py-3 text-sm odd:bg-tint/[0.03]">
            <span className="text-subtle">{index === 0 ? t('city.now') : formatHour(hour.time)}</span>
            <img src={iconUrl(hour.condition.icon)} alt={hour.condition.text} title={hour.condition.text} width={40} height={40} />
            <span className="font-semibold">{round(hour.temp_c)}°</span>
            <span className={`text-xs ${hour.chance_of_rain >= 50 ? 'text-accent' : 'text-faint'}`}>💧{hour.chance_of_rain}%</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
