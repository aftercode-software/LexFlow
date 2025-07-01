export default function Title({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-zinc-600">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
