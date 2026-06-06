
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  Stethoscope,
  IdCard,
  AlertTriangle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Extended doctor type to include IMA ID
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  patients: number;
  status: string;
  location: string;
  nextAvailable: string;
  image: string;
  imaId: string; // Added IMA ID for verification
}

// Initial doctors data
const initialDoctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Emily Chen",
    specialty: "Cardiology",
    email: "emily.chen@hospital.org",
    phone: "(555) 123-4567",
    patients: 142,
    status: "Active",
    location: "Main Building, Floor 3",
    nextAvailable: "Today, 2:00 PM",
    image: "/placeholder.svg",
    imaId: "IMA-KA-23567"
  },
  {
    id: 2,
    name: "Dr. Michael Wong",
    specialty: "General Practice",
    email: "michael.wong@hospital.org",
    phone: "(555) 987-6543",
    patients: 210,
    status: "Active",
    location: "West Wing, Floor 1",
    nextAvailable: "Tomorrow, 9:30 AM",
    image: "/placeholder.svg",
    imaId: "IMA-DL-78901"
  },
  {
    id: 3,
    name: "Dr. Sarah Johnson",
    specialty: "Dermatology",
    email: "sarah.johnson@hospital.org",
    phone: "(555) 456-7890",
    patients: 98,
    status: "On Leave",
    location: "East Wing, Floor 2",
    nextAvailable: "Next Monday, 11:00 AM",
    image: "/placeholder.svg",
    imaId: "IMA-MH-34512"
  },
  {
    id: 4,
    name: "Dr. Robert Smith",
    specialty: "Orthopedics",
    email: "robert.smith@hospital.org",
    phone: "(555) 234-5678",
    patients: 156,
    status: "Active",
    location: "Surgical Center, Floor 4",
    nextAvailable: "Today, 4:30 PM",
    image: "/placeholder.svg",
    imaId: "IMA-TN-45678"
  },
  {
    id: 5,
    name: "Dr. Lisa Martinez",
    specialty: "Pediatrics",
    email: "lisa.martinez@hospital.org",
    phone: "(555) 345-6789",
    patients: 178,
    status: "Active",
    location: "Children's Wing, Floor 2",
    nextAvailable: "Tomorrow, 10:15 AM",
    image: "/placeholder.svg",
    imaId: "IMA-KL-89012"
  },
  {
    id: 6,
    name: "Dr. James Williams",
    specialty: "Neurology",
    email: "james.williams@hospital.org",
    phone: "(555) 567-8901",
    patients: 115,
    status: "Inactive",
    location: "Research Building, Floor 5",
    nextAvailable: "N/A",
    image: "/placeholder.svg",
    imaId: "IMA-GJ-56789"
  }
];

const DoctorsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    location: "",
    status: "Active",
    imaId: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use state with localStorage persistence
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const savedDoctors = localStorage.getItem('doctorsList');
    return savedDoctors ? JSON.parse(savedDoctors) : initialDoctors;
  });
  
  // Save to localStorage whenever doctors change
  useEffect(() => {
    localStorage.setItem('doctorsList', JSON.stringify(doctors));
  }, [doctors]);
  
  const specialties = [
    "All Specialties",
    "Cardiology",
    "General Practice",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Neurology"
  ];
  
  const statuses = [
    "All Statuses",
    "Active",
    "On Leave",
    "Inactive"
  ];

  // Handle input change for new doctor form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isEditDoctorOpen && selectedDoctor) {
      setSelectedDoctor(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewDoctor(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle specialty change
  const handleSpecialtyChange = (value: string) => {
    if (isEditDoctorOpen && selectedDoctor) {
      setSelectedDoctor(prev => prev ? { ...prev, specialty: value } : null);
    } else {
      setNewDoctor(prev => ({ ...prev, specialty: value }));
    }
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    if (isEditDoctorOpen && selectedDoctor) {
      setSelectedDoctor(prev => prev ? { ...prev, status: value } : null);
    } else {
      setNewDoctor(prev => ({ ...prev, status: value }));
    }
  };

  // Add new doctor
  const handleAddDoctor = () => {
    // Validation
    if (!newDoctor.name || !newDoctor.specialty || !newDoctor.email || !newDoctor.imaId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newDoctorComplete: Doctor = {
      id: doctors.length > 0 ? Math.max(...doctors.map(d => d.id)) + 1 : 1,
      name: newDoctor.name || "",
      specialty: newDoctor.specialty || "",
      email: newDoctor.email || "",
      phone: newDoctor.phone || "",
      patients: 0,
      status: newDoctor.status || "Active",
      location: newDoctor.location || "",
      nextAvailable: "Not scheduled",
      image: "/placeholder.svg",
      imaId: newDoctor.imaId || ""
    };

    setDoctors([...doctors, newDoctorComplete]);
    setIsAddDoctorOpen(false);
    setNewDoctor({
      name: "",
      specialty: "",
      email: "",
      phone: "",
      location: "",
      status: "Active",
      imaId: ""
    });

    toast({
      title: "Doctor Added",
      description: `${newDoctorComplete.name} has been added to the directory.`
    });
  };

  // Open edit dialog with doctor data
  const handleOpenEditDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDoctorOpen(true);
  };

  // Update doctor
  const handleUpdateDoctor = () => {
    if (!selectedDoctor) return;

    // Validation
    if (!selectedDoctor.name || !selectedDoctor.specialty || !selectedDoctor.email || !selectedDoctor.imaId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const updatedDoctors = doctors.map(doc => 
      doc.id === selectedDoctor.id ? selectedDoctor : doc
    );

    setDoctors(updatedDoctors);
    setIsEditDoctorOpen(false);
    
    toast({
      title: "Doctor Updated",
      description: `${selectedDoctor.name}'s information has been updated.`
    });
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  // Remove doctor
  const handleRemoveDoctor = () => {
    if (!selectedDoctor) return;
    
    const updatedDoctors = doctors.filter(doc => doc.id !== selectedDoctor.id);
    setDoctors(updatedDoctors);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Doctor Removed",
      description: `${selectedDoctor.name} has been removed from the directory.`
    });
  };
  
  // Filter doctors based on search term and filters
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === "" || specialtyFilter === "All Specialties" || 
                             doctor.specialty === specialtyFilter;
    const matchesStatus = statusFilter === "" || statusFilter === "All Statuses" || 
                          doctor.status === statusFilter;
    
    return matchesSearch && matchesSpecialty && matchesStatus;
  });
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Doctors Directory</h2>
          <p className="text-gray-500">Manage and view all healthcare providers</p>
        </div>
        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Enter the details of the new doctor to add to the directory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name*
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Dr. Full Name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialty" className="text-right">
                  Specialty*
                </Label>
                <div className="col-span-3">
                  <Select value={newDoctor.specialty} onValueChange={handleSpecialtyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.filter(s => s !== "All Specialties").map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email*
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newDoctor.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="doctor@hospital.org"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newDoctor.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={newDoctor.location}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Building and floor"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select value={newDoctor.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.filter(s => s !== "All Statuses").map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imaId" className="text-right">
                  IMA ID*
                </Label>
                <Input
                  id="imaId"
                  name="imaId"
                  value={newDoctor.imaId}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="IMA-XX-12345"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDoctorOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddDoctor}>
                Add Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit Doctor Dialog */}
      <Dialog open={isEditDoctorOpen} onOpenChange={setIsEditDoctorOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information in the directory.
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name*
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={selectedDoctor.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Dr. Full Name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-specialty" className="text-right">
                  Specialty*
                </Label>
                <div className="col-span-3">
                  <Select value={selectedDoctor.specialty} onValueChange={handleSpecialtyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.filter(s => s !== "All Specialties").map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email*
                </Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={selectedDoctor.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="doctor@hospital.org"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={selectedDoctor.phone}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">
                  Location
                </Label>
                <Input
                  id="edit-location"
                  name="location"
                  value={selectedDoctor.location}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Building and floor"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <div className="col-span-3">
                  <Select value={selectedDoctor.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.filter(s => s !== "All Statuses").map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-imaId" className="text-right">
                  IMA ID*
                </Label>
                <Input
                  id="edit-imaId"
                  name="imaId"
                  value={selectedDoctor.imaId}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="IMA-XX-12345"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDoctorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateDoctor}>
              Update Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Doctor Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedDoctor?.name} from the directory? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDoctor} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search doctors..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by specialty" />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <div className="flex items-center mt-1">
                      <Stethoscope className="h-3.5 w-3.5 text-health-600 mr-1" />
                      <span className="text-sm text-health-600">{doctor.specialty}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  doctor.status === "Active" ? "bg-green-100 text-green-800" : 
                  doctor.status === "On Leave" ? "bg-yellow-100 text-yellow-800" : 
                  "bg-gray-100 text-gray-800"
                }`}>
                  {doctor.status}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{doctor.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{doctor.phone}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{doctor.patients} patients</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{doctor.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Next available: {doctor.nextAvailable}</span>
                </div>
                <div className="flex items-center mt-1">
                  <IdCard className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 flex items-center">
                    IMA ID: {doctor.imaId}
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-2" />
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenEditDialog(doctor)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleOpenDeleteDialog(doctor)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredDoctors.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No doctors found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;
