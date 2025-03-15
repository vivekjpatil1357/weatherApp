"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Cloud, CloudRain, Droplets, Search, Sunrise, Sunset, Thermometer, Wind } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import WeatherIcon from "@/components/weather-icon"

// Weather data type
interface WeatherData {
  coord: {
    lon: number
    lat: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level?: number
    grnd_level?: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  rain?: {
    "1h"?: number
    "3h"?: number
  }
  snow?: {
    "1h"?: number
    "3h"?: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    type?: number
    id?: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  cod: number
}

// Helper functions
const kelvinToCelsius = (kelvin: number) => (kelvin - 273.15).toFixed(1)
const formatTime = (timestamp: number, timezone: number) => {
  const date = new Date((timestamp + timezone) * 1000)
  return date.toUTCString().slice(17, 22)
}
const getWindDirection = (deg: number) => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return directions[Math.round(deg / 45) % 8]
}

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState("London")
  const [searchQuery, setSearchQuery] = useState("")
  // const { toast } = useToast()

  const fetchWeatherData = async (cityName: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(cityName)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Please enter a valid city name")
      }

      const data = await response.json()
      setWeatherData(data)
      setCity(data.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast.error(err instanceof Error ? err.message : "Please enter a valid city name")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery)
    }
  }

  // Fetch weather data on initial load
  useEffect(() => {
    fetchWeatherData(city)
  }, [])

  if (error && !weatherData) {
    return (
      <Card className="p-6 text-center border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <div className="text-destructive mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="text-xl font-bold">Failed to load weather data</h2>
        </div>
        <p className="mb-4">{error}</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Try another city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-6">
        <Input
          type="text"
          placeholder="Search for a city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </span>
          )}
        </Button>
      </form>

      {loading ? (
        <WeatherDashboardSkeleton />
      ) : weatherData ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-primary">
                {weatherData.name}, {weatherData.sys.country}
              </h1>
              <p className="text-muted-foreground">
                {new Date(weatherData.dt * 1000).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader className="pb-2">
                <CardTitle>Current Weather</CardTitle>
                <CardDescription>
                  {weatherData.weather[0].description.charAt(0).toUpperCase() +
                    weatherData.weather[0].description.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-5xl font-bold">{kelvinToCelsius(weatherData.main.temp)}°C</span>
                    <span className="text-muted-foreground flex items-center gap-1 mt-1">
                      <Thermometer className="h-4 w-4" />
                      Feels like {kelvinToCelsius(weatherData.main.feels_like)}°C
                    </span>
                    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-blue-500">↓</span> {kelvinToCelsius(weatherData.main.temp_min)}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">↑</span> {kelvinToCelsius(weatherData.main.temp_max)}°C
                      </span>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <WeatherIcon iconCode={weatherData.weather[0].icon} size={96} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
              <CardHeader className="pb-2">
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <p className="text-2xl font-semibold">{weatherData.wind.speed.toFixed(1)} m/s</p>
                    <p className="text-sm text-muted-foreground">
                      Direction: {getWindDirection(weatherData.wind.deg)} ({weatherData.wind.deg}°)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <p className="text-2xl font-semibold">{weatherData.main.humidity}%</p>
                    <Progress value={weatherData.main.humidity} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Clouds</span>
                    </div>
                    <p className="text-2xl font-semibold">{weatherData.clouds.all}%</p>
                    <Progress value={weatherData.clouds.all} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-5 w-5 text-blue-500" />
                      <span className="text-sm font-medium">Precipitation</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {weatherData.rain && weatherData.rain["1h"] ? `${weatherData.rain["1h"].toFixed(1)} mm` : "0 mm"}
                    </p>
                    <Progress
                      value={
                        weatherData.rain && weatherData.rain["1h"] ? Math.min(weatherData.rain["1h"] * 10, 100) : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="pb-2">
              <CardTitle>Sun & Pressure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">Sunrise</span>
                  </div>
                  <p className="text-2xl font-semibold">{formatTime(weatherData.sys.sunrise, weatherData.timezone)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sunset className="h-5 w-5 text-orange-500" />
                    <span className="text-sm font-medium">Sunset</span>
                  </div>
                  <p className="text-2xl font-semibold">{formatTime(weatherData.sys.sunset, weatherData.timezone)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M22 12h-4"></path>
                      <path d="M6 12H2"></path>
                      <path d="M12 6V2"></path>
                      <path d="M12 22v-4"></path>
                      <circle cx="12" cy="12" r="6"></circle>
                    </svg>
                    <span className="text-sm font-medium">Pressure</span>
                  </div>
                  <p className="text-2xl font-semibold">{weatherData.main.pressure} hPa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

function WeatherDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Skeleton className="h-12 w-24 mb-2" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-24 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

