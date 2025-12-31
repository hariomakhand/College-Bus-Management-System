import React from "react";
import Navbar from "../components/layouts/Navbar";
import clgImage from "../assets/clg.jpg";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Simple Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img 
            src={clgImage} 
            alt="College Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
         
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white space-y-6 sm:space-y-8 text-center sm:text-left max-w-4xl mx-auto sm:mx-0">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Bus Management
                </span>
                <br />
                <span className="text-blue-400">System</span>
              </h1>
            </div>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto sm:mx-0">
              Transform your educational institution's transportation with our comprehensive, 
              intelligent bus management solution designed for the modern era.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-6 justify-center sm:justify-start">
              <button 
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started Today
              </button>
              
              <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                Watch Demo
              </button>
            </div>
            
           
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 " id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                  About Our Platform
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
                  Transforming Educational Transportation
                </h2>
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                  Our comprehensive bus management system streamlines transportation operations for educational institutions, 
                  providing real-time visibility, enhanced safety, and operational efficiency.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Fleet Monitoring</h4>
                    <p className="text-gray-600">Track all vehicles with GPS precision and live updates</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Automated Student Management</h4>
                    <p className="text-gray-600">Streamlined registration and approval workflows</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Comprehensive Analytics</h4>
                    <p className="text-gray-600">Data-driven insights for operational optimization</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 lg:mt-0">
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">800+</div>
                <div className="text-sm sm:text-base text-gray-600">Active Students</div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">10+</div>
                <div className="text-sm sm:text-base text-gray-600">Bus Routes</div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">99.9%</div>
                <div className="text-sm sm:text-base text-gray-600">Uptime</div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-lg text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm sm:text-base text-gray-600">Support</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Comprehensive Transportation Solutions</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              From route optimization to student management, we provide end-to-end solutions 
              for modern educational transportation needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-blue-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">📍</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">GPS Tracking & Monitoring</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Real-time vehicle tracking with precise location data, route monitoring, and instant alerts for enhanced safety and operational control.</p>
            </div>
            
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-green-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">👥</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">Student Management Portal</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Streamlined registration process, application tracking, and automated approval workflows for efficient student onboarding.</p>
            </div>
            
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-purple-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">🚗</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">Fleet & Driver Management</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Complete driver assignment system, schedule management, and performance tracking for optimal fleet utilization.</p>
            </div>
            
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-orange-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">🗺️</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">Route Optimization</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Intelligent route planning algorithms to minimize travel time, reduce fuel costs, and maximize operational efficiency.</p>
            </div>
            
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-red-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">🔔</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">Smart Notifications</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Automated alerts and real-time notifications for students, parents, and administrators to ensure seamless communication.</p>
            </div>
            
            <div className="group bg-white p-6 md:p-7 lg:p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 md:mb-5 lg:mb-6 group-hover:bg-indigo-600 transition-colors">
                <span className="text-xl md:text-xl lg:text-2xl group-hover:text-white transition-colors">📊</span>
              </div>
              <h3 className="text-lg md:text-xl lg:text-xl font-semibold mb-3 text-gray-900">Analytics & Reporting</h3>
              <p className="text-sm md:text-base lg:text-base text-gray-600 leading-relaxed">Comprehensive dashboard with detailed analytics, performance metrics, and customizable reports for data-driven decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              Contact Us
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Get In Touch</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to transform your transportation system? Contact our team for a personalized consultation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mt-10">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Email Support</h4>
                  <p className="text-gray-600 mb-2">Get help from our support team</p>
                  <a href="mailto:support@busmanagement.com" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@busmanagement.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📱</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Phone Support</h4>
                  <p className="text-gray-600 mb-2">Available Monday to Friday, 9 AM - 6 PM</p>
                  <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-700 font-medium">
                    +91 (555) 123-4567
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">College Address</h4>
                  <p className="text-gray-600 mb-2">Visit us at our College</p>
                  <p className="text-gray-700">123 Tech Street, Innovation City, IC 12345</p>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mt-8 lg:mt-0">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  subject: formData.get('subject'),
                  message: formData.get('message')
                };
                
                // Create Gmail compose URL
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@busmanagement.com&su=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`)}`;
                
                // Open Gmail in new tab
                window.open(gmailUrl, '_blank');
                
                alert(`Thank you ${data.name}! Gmail has been opened to send your message.`);
                e.target.reset();
              }} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="5"
                    name="message"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about your requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Send Message via Gmail
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              
              <span className="text-lg font-semibold">Smart Bus Management System</span>
            </div>
            <p className="text-gray-400">
              &copy; 2025 Bus Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;