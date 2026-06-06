const API_BASE = 'https://backendnode-j51t.onrender.com/api';

class ApiService {
    constructor() {
        this.baseURL = API_BASE;
    }

    async request(url, options = {}) {
        try {
          // Get the full URL
          const fullUrl = `${this.baseURL}${url}`;
          console.log("Making request to:", fullUrl);
          
          // Include credentials to send cookies
          const response = await fetch(fullUrl, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options.headers
            },
            credentials: 'include' // This is crucial - it sends cookies with request
          });
            console.log("Response status:", response.status);
            // Log the response headers to debug
            console.log("Response headers:", {
                'set-cookie': response.headers.get('set-cookie'),
                'content-type': response.headers.get('content-type')
            });
            // Check if the response is JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            // Parse response
            const data = isJson ? await response.json() : await response.text();

            // Handle error responses
            if (!response.ok) {
                const error = isJson && data.message 
                    ? new Error(data.message)
                    : new Error(`API request failed with status ${response.status}`);
                
                console.error('API Error Response:', data);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async loginPatient(credentials) {
        console.log("Attempting to login patient:", credentials.email);
        const response = await this.request('/auth/patient/login', {
          method: 'POST',
          body: JSON.stringify(credentials),
          credentials: 'include' // Include credentials to send cookies
        });
        console.log("Login response received:", response);
        return response;
      }

    // Use the correct endpoint for patient registration
    async registerPatient(userData) {
        console.log('Registering patient with data:', userData);
        return this.request('/auth/patient/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async loginDoctor(credentials) {
        return this.request('/auth/doctor/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async registerDoctor(userData) {
        return this.request('/auth/doctor/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Patient endpoints
    async getPatientDashboard() {
        return this.request('/patients/dashboard');
    }

    async getPatientProfile() {
        return this.request('/patients/profile', {
            method: 'GET',
            credentials: 'include' // This is already in your request method, just confirming
        });
    }

    async updatePatientProfile(data) {
        return this.request('/patients/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async searchDoctors(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/patients/doctors/search?${queryString}`);
    }

    async getDoctorDetails(doctorId) {
        return this.request(`/patients/doctors/${doctorId}`);
    }

    // Doctor endpoints
    async getDoctorDashboard() {
        return this.request('/doctors/dashboard');
    }

    // Fix the getDoctorProfile method
    async getDoctorProfile() {
        // Get the doctor ID from localStorage
        const doctorId = localStorage.getItem('userId');
        
        // Include it in the request
        return this.request('/doctors/profile', {
            method: 'GET',      
            credentials: 'include' // Include credentials to send cookies  
        });
    }

    async updateDoctorProfile(data) {
        return this.request('/doctors/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async getDoctorAppointments(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/doctors/appointments?${queryString}`);
    }

    async getAvailableSlots(date) {
        return this.request(`/doctors/available-slots?date=${date}`);
    }

    // Appointment endpoints
    async bookAppointment(data) {
        return this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async getAppointment(appointmentId) {
        return this.request(`/appointments/${appointmentId}`);
    }

    
    async cancelAppointment(appointmentId) {
        return this.request(`/appointments/${appointmentId}`, {
            method: 'DELETE',
            credentials: 'include' // Include credentials to send cookies
        });
    }

    async rateAppointment(appointmentId, rating) {
        return this.request(`/appointments/${appointmentId}/rate`, {
            method: 'POST',
            body: JSON.stringify(rating),
            credentials: 'include' // Include credentials to send cookies
        });
    }

    // Update the existing getVideoMeeting method
    async getVideoMeeting(appointmentId) {
        return this.request(`/appointments/${appointmentId}/video`);
    }
    
    // Add this method
    async updateMeetingStatus(appointmentId, status, data = {}) {
        return this.request(`/appointments/${appointmentId}`, {
            method: 'PUT',
            body: JSON.stringify({
                status,
                ...data
            }),
            credentials: 'include' // Include credentials to send cookies
        });
    }
    // Add these methods to your ApiService class

    // Get all doctors with optional filtering
    async getAllDoctors(specialization = '') {
        const queryParams = specialization ? `?specialization=${specialization}` : '';
        return this.request(`/doctors${queryParams}`);
    }
    
    // Get a specific doctor's details
    async getDoctorById(doctorId) {
        return this.request(`/doctors/${doctorId}`);
    }
    
    // Get available time slots for a doctor on a specific date
    async getAvailableSlots(doctorId, date) {
        return this.request(`/doctors/${doctorId}/available-slots?date=${date}`);
    }
    
    // Create a new appointment
    async createAppointment(appointmentData) {
        return this.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
        credentials: 'include' // Include credentials to send cookies
        });
    }
    
    // Get patient's appointments
    async getPatientAppointments() {
        return this.request('/patients/appointments');
    }
    
    // Get doctor's appointments
    async getDoctorAppointments(status = '') {
        const queryParams = status ? `?status=${status}` : '';
        return this.request(`/doctors/appointments${queryParams}`);
    }
    
    // Update appointment status
    async updateAppointmentStatus(appointmentId, status) {
        return this.request(`/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
        credentials: 'include' // Include credentials to send cookies
        });
    }
    
    // Reschedule an appointment
    async rescheduleAppointment(appointmentId, newDate, newTimeSlot) {
        return this.request(`/appointments/${appointmentId}/reschedule`, {
          method: 'PUT',
          body: JSON.stringify({ 
            appointmentDate: newDate,
            timeSlot: newTimeSlot
          })
        });
        }
    async addPrescription(appointmentId, prescriptionData) {
    return this.request(`/doctors/appointments/${appointmentId}/prescription`, {
        method: 'POST',
        body: JSON.stringify(prescriptionData),
        credentials: 'include' // Include credentials to send cookies
    });
}

};

export default new ApiService();
