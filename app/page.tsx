import WeatherDashboard from "@/components/weather-dashboard"
import { Toaster } from "sonner"
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Toaster position="top-center" richColors />
        <WeatherDashboard />
      </div>
    </main>
  )
}

