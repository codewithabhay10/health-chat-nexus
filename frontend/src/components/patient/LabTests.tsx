import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestTube, Calendar, Clock, MapPin, Check, AlertCircle, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
// import testdata from "./testdata.json"; // Uncomment if you want to use local test data

interface LabTest {
  id: string;
  name: string;
  description: string;
  price: string;
  preparationInstructions: string;
  processingTime: string;
  category: string;
}

async function fetchData() {
  const response = await fetch("https://database-tval.onrender.com/test", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to fetch data:", data);
  }
  return data.data;
}

async function bookTest(booking: any) {
  const userId = localStorage.getItem("userId");
  const response = await fetch("https://database-tval.onrender.com/test/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      test_id: booking.id,
      user_id: userId,
      date: booking.date,
      time: booking.timeSlot,
      address: booking.address,
      status: "scheduled"
    })
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to create booking:", data);
  }
  return data;
}

interface LabTestBooking {
  id: string;
  tests: LabTest[];
  date: string;
  timeSlot: string;
  address: string;
  status: "scheduled" | "completed" | "canceled";
  totalPrice: number;
}

const timeSlots = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
];

async function fetchBookedTests() {
  const response = await fetch("https://database-tval.onrender.com/test/booked", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to fetch booked tests:", data);
    return [];
  }
  return data.data || [];
}

const LabTests = () => {
  const { toast } = useToast();
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState("available");
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);
  const [bookings, setBookings] = useState<LabTestBooking[]>([]);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<LabTestBooking | null>(null);

  // Booking form states
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTimeSlot, setBookingTimeSlot] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");

  // Fetch lab tests and booked tests from backend
  useEffect(() => {
    // Fetch available lab tests
    const allTests: LabTest[] = [];
    fetchData().then((data) => {
      data.forEach((item: any) => {
        allTests.push({
          id: item._id,
          name: item.name,
          description: item.description,
          price: item.cost,
          preparationInstructions: item.preparationInstructions || "",
          processingTime: item.time || "24 hours",
          category: item.category
        });
      });
      setLabTests(allTests);
    });

    // Fetch booked tests from backend
    fetchBookedTests().then((booked) => {
      // Map backend data to LabTestBooking[]
      const mapped = booked.map((item: any) => ({
        id: item._id,
        tests: Array.isArray(item.tests) ? item.tests : [item.test], // adjust as per your backend
        date: item.date,
        timeSlot: item.time,
        address: item.address,
        status: item.status,
        totalPrice: item.totalPrice || 0
      }));
      setBookings(mapped);
    });
  }, [translate]);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('labTestBookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const handleTestSelection = (test: LabTest) => {
    const isAlreadySelected = selectedTests.some(t => t.id === test.id);

    if (isAlreadySelected) {
      setSelectedTests(selectedTests.filter(t => t.id !== test.id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleBookNow = () => {
    if (selectedTests.length === 0) {
      toast({
        title: translate("No Tests Selected"),
        description: translate("Please select at least one test to continue."),
        variant: "destructive"
      });
      return;
    }

    setShowBookingDialog(true);
  };

  const calculateTotal = () => {
    return selectedTests.reduce((sum, test) => sum + Number(test.price.replace(/[^\d]/g, "")), 0);
  };

  // Book each selected test individually to the backend and refresh bookings from backend
  const handleConfirmBooking = async () => {
    if (!bookingDate || !bookingTimeSlot || !bookingAddress) {
      toast({
        title: translate("incompleteInformation"),
        description: translate("Please fill in all the required fields."),
        variant: "destructive"
      });
      return;
    }

    // Book each selected test individually
    for (const test of selectedTests) {
      await bookTest({
        id: test.id,
        date: bookingDate,
        timeSlot: bookingTimeSlot,
        address: bookingAddress
      });
    }

    // Refresh bookings from backend
    fetchBookedTests().then((booked) => {
      const mapped = booked.map((item: any) => ({
        id: item._id,
        tests: Array.isArray(item.tests) ? item.tests : [item.test],
        date: item.date,
        timeSlot: item.time,
        address: item.address,
        status: item.status,
        totalPrice: item.totalPrice || 0
      }));
      setBookings(mapped);
    });

    setShowBookingDialog(false);
    setSelectedTests([]);
    setBookingDate("");
    setBookingTimeSlot("");
    setBookingAddress("");

    toast({
      title: translate("bookingConfirmed"),
      description: translate("Your lab tests have been scheduled for") + ` ${bookingDate} at ${bookingTimeSlot}.`,
    });

    setActiveTab("bookings");
  };

  const handleViewDetails = (booking: LabTestBooking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const handleCancelBooking = (booking: LabTestBooking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (selectedBooking) {
      // Delete from backend
      try {
        await fetch(`https://database-tval.onrender.com/test/book/${selectedBooking.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        toast({
          title: translate("Error"),
          description: translate("Failed to cancel booking in backend."),
          variant: "destructive"
        });
      }

      // Refresh bookings from backend
      fetchBookedTests().then((booked) => {
        const mapped = booked.map((item: any) => ({
          id: item._id,
          tests: Array.isArray(item.tests) ? item.tests : [item.test],
          date: item.date,
          timeSlot: item.time,
          address: item.address,
          status: item.status,
          totalPrice: item.totalPrice || 0
        }));
        setBookings(mapped);
      });

      setShowCancelDialog(false);

      toast({
        title: translate("Booking Canceled"),
        description: translate("Your lab test booking has been canceled successfully."),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{translate("labTests")}</h2>
          <p className="text-gray-500">{translate("scheduleCollection")}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">{translate("availableLabTests")}</TabsTrigger>
          <TabsTrigger value="bookings">{translate("Your Bookings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4 mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-3/4 space-y-4">
              {labTests.map((test) => (
                <Card
                  key={test.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedTests.some(t => t.id === test.id)
                      ? 'border-2 border-health-500'
                      : ''
                  }`}
                  onClick={() => handleTestSelection(test)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border ${
                          selectedTests.some(t => t.id === test.id)
                            ? 'bg-health-500 border-health-500 flex items-center justify-center'
                            : 'border-gray-300'
                        }`}>
                          {selectedTests.some(t => t.id === test.id) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold">{test.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{test.description}</p>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                              <Clock className="h-3 w-3 mr-1" />
                              {translate("Results in")} {test.processingTime}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-health-50 text-health-700">
                              <TestTube className="h-3 w-3 mr-1" />
                              {translate(test.category)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-semibold text-health-700">{test.price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="md:w-1/4">
              <div className="sticky top-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{translate("Selected Tests")}</CardTitle>
                    <CardDescription>
                      {selectedTests.length} {translate(selectedTests.length !== 1 ? 'tests' : 'test')} {translate("selected")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedTests.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTests.map((test) => (
                          <div key={test.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TestTube className="h-4 w-4 text-health-600" />
                              <span className="text-sm">{test.name}</span>
                            </div>
                            <span className="text-sm font-medium">{test.price}</span>
                          </div>
                        ))}

                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between items-center font-semibold">
                            <span>{translate("Total")}:</span>
                            <span>₹{calculateTotal()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">{translate("No tests selected. Click on tests to add them to your booking.")}</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={selectedTests.length === 0}
                      onClick={handleBookNow}
                    >
                      {translate("bookHomeSampleCollection")}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {booking.status === "scheduled" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {translate("Scheduled")}
                            </span>
                          )}
                          {booking.status === "completed" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {translate("Completed")}
                            </span>
                          )}
                          {booking.status === "canceled" && (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                              {translate("Canceled")}
                            </span>
                          )}
                          <h3 className="font-semibold">
                            {booking.tests.length} {translate(booking.tests.length !== 1 ? 'Tests' : 'Test')} {translate("Booked")}
                          </h3>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{booking.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="text-right mb-2">
                          <span className="font-semibold text-health-700">{translate("Total")}: ₹{booking.totalPrice}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {booking.status === "scheduled" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {translate("cancel")}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewDetails(booking)}
                              >
                                {translate("viewDetails")}
                              </Button>
                            </>
                          )}
                          {(booking.status === "completed" || booking.status === "canceled") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(booking)}
                            >
                              {translate("viewDetails")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <TestTube className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">{translate("No lab test bookings found")}</p>
              <Button
                className="mt-4"
                onClick={() => setActiveTab("available")}
              >
                {translate("Book Your First Test")}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("bookHomeSampleCollection")}</DialogTitle>
            <DialogDescription>
              {translate("Select your preferred date, time, and collection address.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">{translate("collectionDate")}</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">{translate("collectionTime")}</Label>
              <select
                id="time"
                className="w-full p-2 border rounded-md"
                value={bookingTimeSlot}
                onChange={(e) => setBookingTimeSlot(e.target.value)}
              >
                <option value="">{translate("Select a time slot")}</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{translate("collectionAddress")}</Label>
              <Input
                id="address"
                value={bookingAddress}
                onChange={(e) => setBookingAddress(e.target.value)}
                placeholder={translate("Enter your full address")}
              />
            </div>

            <div className="border rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">{translate("Selected Tests")}:</h4>
              <div className="space-y-2">
                {selectedTests.map((test) => (
                  <div key={test.id} className="flex justify-between items-center">
                    <span>{test.name}</span>
                    <span>{test.price}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t font-semibold">
                  <div className="flex justify-between items-center">
                    <span>{translate("Total")}:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              {translate("cancel")}
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={!bookingDate || !bookingTimeSlot || !bookingAddress}
            >
              {translate("confirmBooking")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("Booking Details")}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-health-600" />
                <h3 className="text-lg font-semibold">{translate("Lab Tests Booking")}</h3>
                {selectedBooking.status === "scheduled" && (
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {translate("Scheduled")}
                  </span>
                )}
                {selectedBooking.status === "completed" && (
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    {translate("Completed")}
                  </span>
                )}
                {selectedBooking.status === "canceled" && (
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    {translate("Canceled")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{translate("collectionDate")}</p>
                  <p className="font-medium">{selectedBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{translate("collectionTime")}</p>
                  <p className="font-medium">{selectedBooking.timeSlot}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">{translate("collectionAddress")}</p>
                  <p className="font-medium">{selectedBooking.address}</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">{translate("tests")}:</h4>
                <div className="border rounded-lg divide-y">
                  {selectedBooking.tests.map((test) => (
                    <div key={test.id} className="flex justify-between items-center p-3">
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-xs text-gray-500">{translate("Results in")} {test.processingTime}</p>
                      </div>
                      <span>{test.price}</span>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 font-semibold">
                    <div className="flex justify-between items-center">
                      <span>{translate("Total")}:</span>
                      <span>₹{selectedBooking.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium flex items-center gap-1 mb-2">
                  <AlertCircle className="h-4 w-4 text-health-600" />
                  {translate("Important Instructions")}
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-health-600 flex-shrink-0 mt-0.5" />
                    {translate("Our phlebotomist will arrive during the selected time slot.")}
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-health-600 flex-shrink-0 mt-0.5" />
                    {translate("Please ensure someone is available at the address during the selected time.")}
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-health-600 flex-shrink-0 mt-0.5" />
                    {translate("Results will be available in your Records section after processing.")}
                  </li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedBooking?.status === "scheduled" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleCancelBooking(selectedBooking);
                }}
              >
                {translate("Cancel Booking")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              {translate("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("Cancel Booking")}</DialogTitle>
            <DialogDescription>
              {translate("Are you sure you want to cancel this lab test booking?")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-gray-500">
              {translate("Cancellation is free if done 12 hours before the scheduled time. You can book again at any time.")}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              {translate("Keep Booking")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelBooking}
            >
              {translate("Yes, Cancel Booking")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabTests;