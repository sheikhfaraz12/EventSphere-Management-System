import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./components/Signup";
import Login from "./components/Login";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CustomerDashboard from "./pages/Exhibitor/CustomerDashboard.jsx";

import AddExpo from "./pages/Addexpo.jsx";
import ViewExpo from "./pages/Viewexpo.jsx";
import ExpoDetail from "./pages/ExpoDetails.jsx";
import EditExpo from "./pages/EditExpo.jsx";

import ExhibitorList from "./pages/ExhibitorList.jsx";
import ExhibitorApproval from "./pages/ExhibitorApproval.jsx";
import BoothAssignment from "./pages/BoothAssignment.jsx";

import AnalyticsDashboard from "./pages/AnylaticsDashboard.jsx";
import ExpoRegistration from "./pages/Exhibitor/ExpoRegistration.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />

        {/* Expo */}
        <Route path="/addexpo" element={<AddExpo />} />
        <Route path="/viewexpo" element={<ViewExpo />} />
        <Route path="/expo/:id" element={<ExpoDetail />} />
        <Route path="/editexpo/:id" element={<EditExpo />} />

        {/* Exhibitors */}
        <Route path="/exhibitors" element={<ExhibitorList />} />
        <Route path="/exhibitorapproval" element={<ExhibitorApproval />} />
        <Route path="/boothassignment" element={<BoothAssignment />} />

        {/* Expo Registration */}
        <Route path="/expo-register" element={<ExpoRegistration />} />

        {/* Analytics */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
