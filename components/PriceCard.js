import React from "react";



function PriceCard({
  packageName = "Pro",
  subtitle,
  price = 29,
  billingCycle = "User",
  features = ["1-50 Users", "No limit transactions", "Unlimited query search"],
  isPopular = false,
  priceAtBottom = false,
  className = "",
}) {
  const boxBase =
    "flex flex-col rounded-xl shadow-lg border transition-all duration-200";
  const boxTone = isPopular
    ? "bg-[#1767A9] text-white border-white/10"
    : "bg-white text-black border-gray-200";


  const boxSize = isPopular
    ? "p-8 md:p-10 min-h-[380px] md:min-h-[420px] scale-[1.02] md:scale-105"
    : "p-6 md:p-7 min-h-[320px]";

  return (
    <div className={[boxBase, boxTone, boxSize, className].join(" ")}>
      <h2 className={`font-bold ${isPopular ? "text-white/95" : "text-black"} text-sm`}>
        {packageName}
      </h2>


      
        <p className={`mt-3 mb-4 font-extrabold ${isPopular ? "text-white" : "text-black"} text-3xl`}>
          ${price} <span className={`${isPopular ? "text-white/90" : "text-black/70"} text-base font-semibold`}>/ {billingCycle}</span>
        </p>
      

      {subtitle && (
        <p className={`${isPopular ? "text-white/90" : "text-gray-600"} text-sm mb-3`}>
          {subtitle}
        </p>
      )}


      <ul
        className={[
          "list-disc pl-5 space-y-2 mb-4",
          isPopular ? "text-white/95 marker:text-white/80" : "text-gray-700 marker:text-gray-400",
        ].join(" ")}
      >
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

     
    </div>
  );
}

export default PriceCard;
