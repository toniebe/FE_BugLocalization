function Feature({
  icon,
  title,
  desc,
}) {
  return (
    <Card className="rounded-2xl h-full">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {desc}
      </CardContent>
    </Card>
  );
}

export default Feature;