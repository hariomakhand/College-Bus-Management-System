import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5001/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Bus', 'Driver', 'Route', 'Student', 'Notification'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    checkAuth: builder.query({
      query: () => '/auth/check',
      providesTags: ['User'],
    }),
    // Admin endpoints
    getStats: builder.query({
      query: () => '/admin/stats',
      providesTags: ['User'],
      transformResponse: (response) => response.stats || response,
    }),
    getBuses: builder.query({
      query: () => '/admin/buses',
      providesTags: ['Bus'],
      transformResponse: (response) => response.buses || response,
    }),
    addBus: builder.mutation({
      query: (busData) => ({
        url: '/admin/buses',
        method: 'POST',
        body: busData,
      }),
      invalidatesTags: ['Bus'],
    }),
    deleteBus: builder.mutation({
      query: (id) => ({
        url: `/admin/buses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bus'],
    }),
    getDrivers: builder.query({
      query: () => '/admin/drivers',
      providesTags: ['Driver'],
      transformResponse: (response) => response.drivers || response,
    }),
    addDriver: builder.mutation({
      query: (driverData) => ({
        url: '/admin/drivers',
        method: 'POST',
        body: driverData,
      }),
      invalidatesTags: ['Driver'],
    }),
    deleteDriver: builder.mutation({
      query: (id) => ({
        url: `/admin/drivers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Driver'],
    }),
    updateDriver: builder.mutation({
      query: ({ id, ...driverData }) => ({
        url: `/admin/drivers/${id}`,
        method: 'PUT',
        body: driverData,
      }),
      invalidatesTags: ['Driver'],
    }),
    getRoutes: builder.query({
      query: () => '/admin/routes',
      providesTags: ['Route'],
      transformResponse: (response) => response.routes || response,
    }),
    addRoute: builder.mutation({
      query: (routeData) => ({
        url: '/admin/routes',
        method: 'POST',
        body: routeData,
      }),
      invalidatesTags: ['Route'],
    }),
    deleteRoute: builder.mutation({
      query: (id) => ({
        url: `/admin/routes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Route'],
    }),
    // Students endpoints
    getStudents: builder.query({
      query: () => '/admin/students',
      providesTags: ['Student'],
      transformResponse: (response) => response.students || response,
    }),
    getPendingRegistrations: builder.query({
      query: () => '/admin/pending-registrations',
      providesTags: ['Student'],
      transformResponse: (response) => response.pendingRegistrations || response,
    }),
    getBusRequests: builder.query({
      query: () => '/admin/bus-requests',
      providesTags: ['Student'],
      transformResponse: (response) => response.busRequests || response,
    }),
    handleStudentRegistration: builder.mutation({
      query: (data) => ({
        url: '/admin/handle-registration',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    handleBusRequest: builder.mutation({
      query: (data) => ({
        url: '/admin/handle-bus-request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    updateStudentStatus: builder.mutation({
      query: (data) => ({
        url: '/admin/update-student-status',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    updateStudentBusAssignment: builder.mutation({
      query: (data) => ({
        url: '/admin/update-student-bus',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    sendAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/admin/send-announcement',
        method: 'POST',
        body: data,
      }),
    }),
    addStudent: builder.mutation({
      query: (studentData) => ({
        url: '/admin/students',
        method: 'POST',
        body: studentData,
      }),
      invalidatesTags: ['Student'],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/admin/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
    // Bus status update
    updateBusStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/buses/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Bus'],
    }),
    // Update bus
    updateBus: builder.mutation({
      query: ({ id, ...busData }) => ({
        url: `/admin/buses/${id}`,
        method: 'PUT',
        body: busData,
      }),
      invalidatesTags: ['Bus'],
    }),
    // Driver bus assignment
    assignBusToDriver: builder.mutation({
      query: ({ driverId, busId, routeId }) => ({
        url: '/admin/assign-bus',
        method: 'PUT',
        body: { driverId, busId, routeId },
      }),
      invalidatesTags: ['Bus', 'Driver', 'Route'],
    }),
    unassignBusFromDriver: builder.mutation({
      query: (driverId) => ({
        url: '/admin/unassign-bus',
        method: 'PUT',
        body: { driverId },
      }),
      invalidatesTags: ['Bus', 'Driver'],
    }),
    // Route assignment
    assignRouteToDriver: builder.mutation({
      query: ({ driverId, routeId }) => ({
        url: '/admin/assign-route',
        method: 'PUT',
        body: { driverId, routeId },
      }),
      invalidatesTags: ['Route', 'Driver'],
    }),
    unassignRouteFromDriver: builder.mutation({
      query: (driverId) => ({
        url: `/admin/unassign-route/${driverId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Route', 'Driver'],
    }),
    // Notification endpoints
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    // Student endpoints
    studentLogin: builder.mutation({
      query: (credentials) => ({
        url: '/student/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    studentSignup: builder.mutation({
      query: (userData) => ({
        url: '/student/signup',
        method: 'POST',
        body: userData,
      }),
    }),
    getStudentProfile: builder.query({
      query: () => '/student/profile',
      providesTags: ['User'],
    }),
    getStudentDashboard: builder.query({
      query: () => '/student/dashboard',
      providesTags: ['User'],
    }),
    updateStudentProfile: builder.mutation({
      query: (profileData) => ({
        url: '/student/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    applyForBus: builder.mutation({
      query: (applicationData) => ({
        url: '/student/apply-bus',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['User'],
    }),
    getStudentRoutes: builder.query({
      query: () => '/admin/routes',
      providesTags: ['Route'],
      transformResponse: (response) => response.routes || response,
    }),
    sendSupportMessage: builder.mutation({
      query: (messageData) => ({
        url: '/student/support',
        method: 'POST',
        body: messageData,
      }),
    }),
    getStudentBusPass: builder.query({
      query: () => '/student/bus-pass',
      providesTags: ['User'],
    }),
    getStudentAnnouncements: builder.query({
      query: () => '/student/announcements',
      providesTags: ['Notification'],
    }),
    // Driver endpoints
    getDriverDashboard: builder.query({
      query: () => '/driver/dashboard',
      providesTags: ['User'],
    }),
    updateDriverProfile: builder.mutation({
      query: (profileData) => ({
        url: '/driver/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    updateDriverLocation: builder.mutation({
      query: (locationData) => ({
        url: '/driver/update-location',
        method: 'POST',
        body: locationData,
      }),
    }),
    startTrip: builder.mutation({
      query: (tripData) => ({
        url: '/driver/start-trip',
        method: 'POST',
        body: tripData,
      }),
    }),
    endTrip: builder.mutation({
      query: (tripData) => ({
        url: '/driver/end-trip',
        method: 'POST',
        body: tripData,
      }),
    }),
    sendDriverNotification: builder.mutation({
      query: (notificationData) => ({
        url: '/driver/send-notification',
        method: 'POST',
        body: notificationData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useCheckAuthQuery,
  useGetStatsQuery,
  useGetBusesQuery,
  useAddBusMutation,
  useDeleteBusMutation,
  useGetDriversQuery,
  useAddDriverMutation,
  useDeleteDriverMutation,
  useUpdateDriverMutation,
  useGetRoutesQuery,
  useAddRouteMutation,
  useDeleteRouteMutation,
  useGetStudentsQuery,
  useGetPendingRegistrationsQuery,
  useGetBusRequestsQuery,
  useHandleStudentRegistrationMutation,
  useHandleBusRequestMutation,
  useUpdateStudentStatusMutation,
  useUpdateStudentBusAssignmentMutation,
  useSendAnnouncementMutation,
  useAddStudentMutation,
  useDeleteStudentMutation,
  useUpdateBusStatusMutation,
  useUpdateBusMutation,
  useAssignBusToDriverMutation,
  useUnassignBusFromDriverMutation,
  useAssignRouteToDriverMutation,
  useUnassignRouteFromDriverMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useStudentLoginMutation,
  useStudentSignupMutation,
  useGetStudentProfileQuery,
  useGetStudentDashboardQuery,
  useUpdateStudentProfileMutation,
  useApplyForBusMutation,
  useGetStudentRoutesQuery,
  useSendSupportMessageMutation,
  useGetStudentBusPassQuery,
  useGetStudentAnnouncementsQuery,
  useGetDriverDashboardQuery,
  useUpdateDriverProfileMutation,
  useUpdateDriverLocationMutation,
  useStartTripMutation,
  useEndTripMutation,
  useSendDriverNotificationMutation,
} = apiSlice;