import React from "react";

function PriceCard({
  packageName = "Fitur",
  subtitle,
  price = null,
  billingCycle = "User",
  features = [],
  className = "",
}) {
  const showPrice = typeof price === "number";

  const boxBase =
    "flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8 h-full";

  return (
    <div className={`${boxBase} ${className}`}>
      {/* Judul fitur / paket */}
      <h3 className="text-sm font-semibold text-sky-700 tracking-wide uppercase">
        {packageName}
      </h3>

      {/* Harga (opsional, kalau nanti mau dipakai lagi) */}
      {showPrice && (
        <p className="mt-3 mb-3 text-3xl font-bold text-slate-900">
          ${price}
          {billingCycle && (
            <span className="text-base font-medium text-slate-500">
              {" "}
              / {billingCycle}
            </span>
          )}
        </p>
      )}

      {/* Deskripsi singkat */}
      {subtitle && (
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* List fitur */}
      {features && features.length > 0 && (
        <ul className="mt-auto space-y-2 text-sm text-slate-700">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PriceCard;
