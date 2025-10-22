import React from "react";
function Step({
  n,
  icon,
  title,
  desc,
}) {
  return (
    <div className="relative p-4 rounded-2xl border bg-background">
      <div className="absolute -top-3 -left-3 h-8 w-8 rounded-xl grid place-items-center bg-primary text-primary-foreground text-sm font-semibold shadow">
        {n}
      </div>
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default Step;
