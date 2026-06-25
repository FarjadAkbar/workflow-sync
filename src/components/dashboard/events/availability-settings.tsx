"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Save } from "lucide-react"
import { useAvailability, useUpdateAvailability } from "@/service/events"
import { toast } from "@/hooks/use-toast"

const days = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
]

const timeSlots = Array.from({ length: 24 * 4 }).map((_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`,
  }
})

export function AvailabilitySettings() {
  const { data: availabilityData, isLoading } = useAvailability()
  const { mutate: updateAvailability, isPending } = useUpdateAvailability()

  const [availability, setAvailability] = useState<
    Array<{
      id?: string
      day: string
      startTime: string
      endTime: string
      isActive: boolean
    }>
  >([])

  // Initialize availability settings when data is loaded
  useEffect(() => {
    if (availabilityData) {
      setAvailability(availabilityData)
    } else {
      // Default availability for all days
      setAvailability(
        days.map((day) => ({
          day: day.value,
          startTime: "09:00",
          endTime: "17:00",
          isActive: day.value !== "SATURDAY" && day.value !== "SUNDAY",
        })),
      )
    }
  }, [availabilityData])

  const handleToggleDay = (dayValue: string) => {
    setAvailability(availability.map((item) => (item.day === dayValue ? { ...item, isActive: !item.isActive } : item)))
  }

  const handleChangeTime = (dayValue: string, field: "startTime" | "endTime", value: string) => {
    setAvailability(availability.map((item) => (item.day === dayValue ? { ...item, [field]: value } : item)))
  }

  const handleSave = async () => {
    try {
      // Save each availability setting
      for (const item of availability) {
        await updateAvailability(item)
      }

      toast({
        title: "Availability updated",
        description: "Your availability settings have been saved",
      })
    } catch (error) {
      toast({
        title: "Failed to update availability",
        description: "There was an error saving your availability settings",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Settings</CardTitle>
          <CardDescription>Set your available hours for meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Settings</CardTitle>
        <CardDescription>Set your available hours for meetings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {days.map((day) => {
            const dayAvailability = availability.find((a) => a.day === day.value) || {
              day: day.value,
              startTime: "09:00",
              endTime: "17:00",
              isActive: day.value !== "SATURDAY" && day.value !== "SUNDAY",
            }

            return (
              <div key={day.value} className="flex items-center space-x-4">
                <div className="w-24">
                  <Label>{day.label}</Label>
                </div>
                <Switch checked={dayAvailability.isActive} onCheckedChange={() => handleToggleDay(day.value)} />

                {dayAvailability.isActive && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={dayAvailability.startTime}
                        onValueChange={(value) => handleChangeTime(day.value, "startTime", value)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>to</span>
                      <Select
                        value={dayAvailability.endTime}
                        onValueChange={(value) => handleChangeTime(day.value, "endTime", value)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )
          })}

          <Button onClick={handleSave} disabled={isPending} className="mt-4">
            {isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Availability
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

