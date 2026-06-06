import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const BookAppointment = () => {
    const { doctorId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [doctor, setDoctor] = useState(null);
    const [formData, setFormData] = useState({
        appointmentDate: '',
        timeSlot: '',
        symptoms: '',
        consultationType: 'video'
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDoctorDetails();
    }, [doctorId]);

    useEffect(() => {
        if (formData.appointmentDate) {
            loadAvailableSlots();
        }
    }, [formData.appointmentDate]);

    const loadDoctorDetails = async () => {
        try {
            const response = await apiService.getDoctorDetails(doctorId);
            setDoctor(response.doctor);
        } catch (error) {
            setError('Failed to load doctor details');
        }
    };

    const loadAvailableSlots = async () => {
        try {
            const response = await apiService.getAvailableSlots(formData.appointmentDate);
            setAvailableSlots(response.availableSlots);
        } catch (error) {
            console.error('Failed to load available slots:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const appointmentData = {
                doctorId,
                ...formData
            };

            await apiService.bookAppointment(appointmentData);
            navigate('/patient-dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!doctor) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
                    </div>
                    
                    <div className="p-6">
                        {/* Doctor Info */}
                        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900">Dr. {doctor.name}</h2>
                            <p className="text-gray-600">{doctor.specialization}</p>
                            <p className="text-gray-600">{doctor.experience} years experience</p>
                            <p className="text-lg font-medium text-blue-600">₹{doctor.consultationFee}</p>
                        </div>

                        {/* Booking Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Appointment Date
                                </label>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {availableSlots.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Available Time Slots
                                    </label>
                                    <select
                                        name="timeSlot"
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.timeSlot}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select a time slot</option>
                                        {availableSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Consultation Type
                                </label>
                                <select
                                    name="consultationType"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={formData.consultationType}
                                    onChange={handleChange}
                                >
                                    <option value="video">Video Call</option>
                                    <option value="audio">Audio Call</option>
                                    <option value="chat">Chat</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Symptoms/Reason for Visit
                                </label>
                                <textarea
                                    name="symptoms"
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Describe your symptoms or reason for consultation..."
                                    value={formData.symptoms}
                                    onChange={handleChange}
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Booking...' : 'Book Appointment'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;
