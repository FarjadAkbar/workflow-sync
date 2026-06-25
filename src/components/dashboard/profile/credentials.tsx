"use client"
import React, {useState} from 'react'
import H4Title from "@/components/typography/h4";
import Link from "next/link";
import { toast } from "@/hooks/use-toast"
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Users } from '@prisma/client';

interface ProfileFormProps {
  data: Users;
}

export function Credentials({ data }: ProfileFormProps) {
    const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({})
  
    const handleCopy = (text: string, label: string, fieldId: string) => {
      navigator.clipboard.writeText(text)
  
      // Set this specific field as copied
      setCopiedFields((prev) => ({ ...prev, [fieldId]: true }))
  
      toast({
        title: "Copied to clipboard",
        description: `${label} has been copied to your clipboard`,
      })
  
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedFields((prev) => ({ ...prev, [fieldId]: false }))
      }, 2000)
    }
  
    const credentials = [
        {
          title: "Zoom Meeting",
          url: "https://zoom.us/signin#/login",
          linkText: "Open Zoom",
          fields: [
            { label: "Meeting Id", value: "760.786.7786", id: "zoom_id" },
            { label: "Password", value: "frutti", id: "zoom_password" },
          ],
        },
      ]
  
    return (
      <div className="max-w-5xl mx-auto px-2 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {credentials.map((credential, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 transition-all hover:shadow-xl border border-gray-100"
            >
              <H4Title>{credential.title}</H4Title>
  
              <Link
                href={credential.url}
                className="inline-flex items-center mt-4 bg-black text-gold hover:bg-gold hover:text-black px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {credential.linkText}
                <ExternalLink className="h-4 w-4" />
              </Link>
  
              <div className="mt-6 space-y-4">
                {credential.fields.map((field) => (
                  <div key={field.id} className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                    <div
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors group"
                      onClick={() => handleCopy(field.value, field.label, field.id)}
                    >
                      <span className="text-gray-800 font-medium">{field.value}</span>
                      <Button variant="ghost" size="icon-sm" className="hover:bg-gray-200">
                        {copiedFields[field.id] ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
