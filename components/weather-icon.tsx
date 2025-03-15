"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from "lucide-react"

interface WeatherIconProps {
  iconCode: string
  size?: number
  className?: string
}

export default function WeatherIcon({ iconCode, size = 64, className }: WeatherIconProps) {
  const [Icon, setIcon] = useState<React.ElementType>(Cloud)
  const [color, setColor] = useState<string>("text-gray-400")

  useEffect(() => {
    // Map OpenWeatherMap icon codes to Lucide icons
    switch (iconCode) {
      case "01d":
        setIcon(Sun)
        setColor("text-amber-400")
        break
      case "01n":
        setIcon(Sun)
        setColor("text-amber-300")
        break
      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        setIcon(Cloud)
        setColor("text-gray-400")
        break
      case "09d":
      case "09n":
        setIcon(CloudDrizzle)
        setColor("text-blue-400")
        break
      case "10d":
      case "10n":
        setIcon(CloudRain)
        setColor("text-blue-500")
        break
      case "11d":
      case "11n":
        setIcon(CloudLightning)
        setColor("text-amber-500")
        break
      case "13d":
      case "13n":
        setIcon(CloudSnow)
        setColor("text-blue-200")
        break
      case "50d":
      case "50n":
        setIcon(CloudFog)
        setColor("text-gray-300")
        break
      default:
        setIcon(Cloud)
        setColor("text-gray-400")
    }
  }, [iconCode])

  return <Icon size={size} className={`${color} ${className}`} />
}

