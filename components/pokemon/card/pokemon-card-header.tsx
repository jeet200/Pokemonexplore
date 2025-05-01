export function PokemonCardHeader({ id, name }: { id: number; name: string }) {
  const formattedId = `#${id.toString().padStart(3, "0")}`
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1)

  return (
    <>
      <div className="text-sm text-muted-foreground mb-1">{formattedId}</div>
      <h3 className="font-bold text-lg mb-2">{formattedName}</h3>
    </>
  )
}
