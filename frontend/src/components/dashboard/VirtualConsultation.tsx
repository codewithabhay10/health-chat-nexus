import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video } from "lucide-react";

const VirtualConsultation = () => {
  
  const navigate = useNavigate();
  const [consultations] = useState([
    {
      id: 1,
      patient: "John Smith",
      time: "10:00 AM - 10:30 AM",
      date: "Today",
      status: "Upcoming",
      avatar: "/placeholder.svg",
      initials: "JS"
    },
    {
      id: 2,
      patient: "Sarah Johnson",
      time: "1:30 PM - 2:00 PM",
      date: "Today",
      status: "Upcoming",
      avatar: "/placeholder.svg",
      initials: "SJ"
    },
    {
      id: 3,
      patient: "Michael Brown",
      time: "9:15 AM - 9:45 AM",
      date: "Tomorrow",
      status: "Scheduled",
      avatar: "/placeholder.svg",
      initials: "MB"
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Virtual Consultations</h2>
        <Button>
          <Video className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultations.map((consultation) => (
          <Card key={consultation.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{consultation.patient}</CardTitle>
                  <CardDescription>Virtual Consultation</CardDescription>
                </div>
                <Avatar>
                  <AvatarImage src={consultation.avatar} alt={consultation.patient} />
                  <AvatarFallback>{consultation.initials}</AvatarFallback>
                </Avatar>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{consultation.date}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{consultation.time}</span>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    consultation.status === "Upcoming" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {consultation.status}
                  </span>
                </div>
              </div>
            </CardContent>
            // Update the Join Consultation button
            <CardFooter className="pt-2">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(`/video-conference/${consultation.id}`)}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Consultation
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VirtualConsultation;
