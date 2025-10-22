import React from "react";

function PriceCard({
  name,
  price,
  tagline,
  features,
  cta,
  highlight = false,
}) {
  return (
    <Card className={`rounded-2xl h-full ${highlight ? "border-primary" : ""}`}>
      <CardHeader>
        <div className="flex items-baseline justify-between">
          <CardTitle>{name}</CardTitle>
          {highlight && <Badge>Most popular</Badge>}
        </div>
        <CardDescription>{tagline}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {price}
          <span className="text-base font-medium text-muted-foreground">
            {price !== "Custom" && "/mo"}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" /> {f}
            </li>
          ))}
        </ul>
        <Button
          className="mt-6 w-full"
          variant={highlight ? "default" : "outline"}
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}
export default PriceCard;