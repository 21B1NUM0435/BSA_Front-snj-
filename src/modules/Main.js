import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Spin, notification } from "antd";
import { fetchUserRole, mapGidToRole } from "../services/RoleService";
import "./Main.css";

// Import components
import DeFormSet from "./department/DeFormSet";
import StudentList from "./department/StudentList";
import ConfirmedTopicStud from "./student/ConfirmedTopiclist";
import ProposeTopicStud from "./student/ProposeTopicStud";
import TopicListStud from "./student/TopicListStud";
import ApprovedTopics from "./supervisor/ApprovedTopics";
import ProposedTopics from "./supervisor/ProposedTopics";
import ConfirmedTopics from "./teacher/ConfirmedTopics";
import ProposeTopic from "./teacher/ProposeTopic";
import TopicList from "./teacher/TopicList";
import SideBar from "../components/navbar/SideBar";
import CustomNavBar from "../components/navbar/CustomNavBar";
import NotificationDashboard from "./department/notifications/NotificationDashboard";

function Main({ setUser, logoutFunction }) {
  const { user } = useUser();
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Detect user role on component mount
    const detectUserRole = async () => {
      setRoleLoading(true);
      try {
        // First try to detect role from user object if available
        if (user?.role) {
          setUserRole(user.role);
          setRoleLoading(false);
          return;
        }
        
        if (user?.gid) {
          const roleName = mapGidToRole(user.gid);
          setUserRole(roleName);
          
          // Update user with role information
          setUser(prev => ({
            ...prev,
            role: roleName
          }));
          
          setRoleLoading(false);
          return;
        }
        
        // If no role in user object, fetch from API
        const roleData = await fetchUserRole();
        const roleName = roleData.roleName || mapGidToRole(roleData.gid);
        
        setUserRole(roleName);
        
        // Update user with role information
        setUser(prev => ({
          ...prev,
          role: roleName,
          gid: roleData.gid
        }));
        
        console.log('Role detected:', roleName);
      } catch (error) {
        console.error('Error detecting role:', error);
        setError('Failed to detect user role. Please try logging in again.');
        notification.error({
          message: 'Role Detection Failed',
          description: 'Could not determine your user role. Some features may be unavailable.'
        });
        
        // Fallback to email-based role detection if API fails
        if (user?.email) {
          let fallbackRole = "";
          if (user.email.includes("department")) fallbackRole = "department";
          else if (user.email.includes("supervisor")) fallbackRole = "supervisor";
          else if (user.email.includes("student")) fallbackRole = "student";
          else if (user.email.includes("teacher")) fallbackRole = "teacher";
          
          if (fallbackRole) {
            setUserRole(fallbackRole);
            setUser(prev => ({
              ...prev,
              role: fallbackRole
            }));
          }
        }
      } finally {
        setRoleLoading(false);
      }
    };

    detectUserRole();
  }, [user, setUser]);

  // Define routes based on user role
  const getRoutes = () => {
    switch (userRole) {
      case "department":
        return (
          <>
            <Route index element={<Navigate to="/studentlist" replace />} />
            <Route path="/studentlist" element={<StudentList />} />
            <Route path="/deformset" element={<DeFormSet />} />
            <Route path="/notifications" element={<NotificationDashboard />} />
          </>
        );
      case "supervisor":
        return (
          <>
            <Route index element={<Navigate to="/proposedtopics" replace />} />
            <Route path="/proposedtopics" element={<ProposedTopics />} />
            <Route path="/approvedtopics" element={<ApprovedTopics />} />
          </>
        );
      case "student":
        return (
          <>
            <Route index element={<Navigate to="/topicliststud" replace />} />
            <Route path="/topicliststud" element={<TopicListStud />} />
            <Route path="/proposetopicstud" element={<ProposeTopicStud />} />
            <Route path="/confirmedtopic" element={<ConfirmedTopicStud />} />
          </>
        );
      case "teacher":
        return (
          <>
            <Route index element={<Navigate to="/topiclist" replace />} />
            <Route path="/topiclist" element={<TopicList />} />
            <Route path="/proposetopics" element={<ProposeTopic />} />
            <Route path="/confirmedtopics" element={<ConfirmedTopics />} />
          </>
        );
      default:
        return (
          <Route path="*" element={
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Access Error</h2>
                <p>Your role could not be determined. Please contact an administrator.</p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <button 
                  onClick={logoutFunction}
                  className="mt-4 px-4 py-2 bg-violet-500 text-white rounded"
                >
                  Logout and Try Again
                </button>
              </div>
            </div>
          } />
        );
    }
  };

  const handleMenuToggle = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin tip="Loading user information..." size="large" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <CustomNavBar 
        user={user} 
        setUser={setUser} 
        logoutFunction={logoutFunction} 
        onClick={handleMenuToggle} 
      />
      <div className="content">
        <SideBar user={user} collapsed={menuCollapsed} />
        <div className="routes-content">
          <Routes>
            {getRoutes()}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Main;