// AppRoutes.jsx
import { Routes, Route, Navigate,useLocation  } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Main from "../components/Layouts/Main.jsx";
import LoginPage from "../pages/MainComponents/Login/LoginPage";
import Dashboard from "../pages/MainComponents/Dashboard/Dashboard.jsx";
import UserList from "../pages/UserManagement/UserList.jsx";
import UserRoleAndPermissionList from "../pages/RoleAndPermission/UserRoleAndPermissionList.jsx";
import BaseData from "../pages/BaseData/BaseData.jsx";
import ReportList from "../pages/ReportList/ReportList.jsx";
import ResultsList from "../pages/ResultsList/ResultsList.jsx";
import ExpertReportList from "../pages/Expert/ExpertReportList.jsx";
import ReportForm from "../pages/Expert/reportForm.jsx";
import ReportUpdateForm from "../pages/Expert/reportUpdateForm.jsx";
import NotFoundPage from "../pages/404 page.jsx"

import ReportDetail from "../pages/ReportList/ReportDetail.jsx";
import ExpertReportDetail from "../pages/Expert/ExpertReportDetail.jsx";
import StatsList from "../pages/stats/StatList.jsx";
import RegionList from "../pages/BaseData/Region/RegionList.jsx";
import ZoneList from "../pages/BaseData/CityAndRegionHierarchy/CityOrRegion.jsx";
import ReportCategoryList from "../pages/BaseData/PollutionCategory/PollutionCategoryList.jsx";
import SubPollutionCategoryList from "../pages/BaseData/SubPollutionCategory/SubPollutionCategoryList.jsx";
import TaskForcecGetCase from "../pages/TaskForce/task_force_case_get.jsx";
import TaskForceReportList from "../pages/TaskForce/ReportList.jsx";

import CustomerList from "../pages/Customer/customerList.jsx";
import RegionalList from "../pages/RegionalUser/regionalUserList.jsx"
import ExpertGetCase from "../pages/Expert/expert_case_get.jsx";
import SoundAreaList from "../pages/BaseData/SoundArea/SoundArea.jsx";
import TaskForcecComplaintList from "../pages/TaskForce/task_force_complaint_list.jsx";

import FormTypesList from "../pages/BaseData/FormTypes/FormTypesList.jsx";
import ReportTypesList from "../pages/BaseData/ReportTypes/ReportTypesList.jsx";
import ReportingFormsList from "../pages/BaseData/ReportingForms/ReportingFormsList.jsx";
import SubcityOrZoneDetail from "../pages/BaseData/CityAndRegionHierarchy/SubcityOrZoneDetail.jsx";
import ZoneDetail from "../pages/BaseData/CityAndRegionHierarchy/CityOrRegionDetail.jsx";
import PollutionCategoryDetail from "../pages/BaseData/PollutionCategory/PollutionCategoryDetail.jsx";
import PenaltyCategoryList from "../pages/BaseData/Penality/PenaltyCategoryList.jsx";
import PenaltyCategoryDetail from "../pages/BaseData/Penality/PenaltyCategoryDetail.jsx";
import DuptyDirectorReportList from "../pages/DuptyDirectorReportList/DuptyDirectorReportList.jsx";
import DuptyDirectorReportDetail from "../pages/DuptyDirectorReportList/DuptyDirectorReportDetail.jsx";
import ExpertReportDetailList from "../pages/DuptyDirectorReportList/ExpertReportDetail.jsx";
import AwarenessList from "../pages/BaseData/Awareness/AwarenessList.jsx";
import NewsList from "../pages/BaseData/News/NewsList.jsx";
import AddressList from "../pages/BaseData/Address/AddressList.jsx";
import RegionalReportDetail from "../pages/Region/RegionReportDetail.jsx"
import RegionAdminPage from "../pages/Region/RegionAdminPage.jsx";
import ZoneAdminPage from "../pages/Zone/ZoneAdminPage.jsx";
import ZoneDetailPage from "../pages/Zone/ReportDetail.jsx"
import WoredaAdminPage from "../pages/Woreda/WoredaAdminPage.jsx";
import WoredaDetailPage from "../pages/Woreda/ReportDetail.jsx";

import DeskHeadPage from "../pages/DeskHeadList/DeskHeadReportList.jsx"
import DeskHeadDetail from "../pages/DeskHeadList/DeskHeadReportDetail.jsx"

import RegionalExpertList from "../pages/Region/RegionalExpertList.jsx";
import RegionalExpertCase from "../pages/Region/RegionalExpertCase.jsx";
import RegionalResultsList from "../pages/Region/RegionalResultsList.jsx";

import GeneralReport from "../pages/GeneralReport/GeneralReport.jsx";
import GeneralDashboard from "../pages/GeneralReport/GeneralDashboard.jsx";
import RegionalReviewInvestigation from "../pages/Region/RegionalReviewInvestigation.jsx";
import Organization from "../pages/BaseData/OrganizationalStructure/Organization.jsx";
import FormAndReportTypes from "../pages/BaseData/form-and-report-types/FormAndReportTypes.jsx";
import RejectionReasons from "../pages/BaseData/RejectionReasons/RejectionReasonsList.jsx";
import ProfilePage from "../pages/Profile/ProfilePage.jsx";           // Create this page
import ChangePasswordPage from "../pages/Profile/ChangePasswordPage.jsx"; // Create this page
import ForgotPasswordPage from "../pages/MainComponents/Login/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/MainComponents/Login/ResetPasswordPage.jsx";
import ClearPage from "../pages/ClearPage.jsx";
import { getHomeRoute } from "../utils/getHomeRoute.js";
export default function AppRoutes({ isLoggedIn, permissions, setIsLoggedIn }) {
  const location = useLocation();

  return (
    <Routes>
     <Route
  path="/"
  element={
    isLoggedIn ? (
      (() => {
        const homeRoute = getHomeRoute(permissions);

        if (homeRoute && location.pathname === "/") {
  return <Navigate to={homeRoute} replace />;
}


        return (
          <Main setIsLoggedIn={setIsLoggedIn} headerTitle="">
            <ClearPage />
          </Main>
        );
      })()
    ) : (
      <LoginPage setIsLoggedIn={setIsLoggedIn} />
    )
  }
/>
      

      {/* User List */}
      <Route
        path="/users"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["User:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="User List">
              <UserList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/regional-users"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["User:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Regional User List">
              <RegionalList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["User:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Customer List">
              <CustomerList />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Role & Permission */}
      <Route
        path="/role-and-permission"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["Role:read"]}
          >
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Role and Permission"
            >
              <UserRoleAndPermissionList />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Base Data */}
      <Route
        path="/base-data"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Base Data">
              <BaseData />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/base-data/region"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Region Management">
              <RegionList />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/base-data/region_city"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Zone Management">
              <ZoneList />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Management">
              <ReportList />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/dupty_director_reports"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["deputyDirector:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Management">
              <DuptyDirectorReportList />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dupty_director_reports/detail"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["deputyDirector:read"]}
          >
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Management">
              <DuptyDirectorReportDetail />
            </Main>
          </ProtectedRoute>
        }
      />

     <Route
  path="/dupty_director_reports/expert_form/detail"
  element={
    <ProtectedRoute
      isLoggedIn={isLoggedIn}
      permissions={permissions}
      requiredPermissions={[
        "deputyDirector:read",
        "region:can-review-investigation",
      ]}
    >
      <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Management">
        <ExpertReportDetailList />
      </Main>
    </ProtectedRoute>
  }
/>

      <Route
        path="/expert_report_list"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["expert:report-list-read"]}
          >
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Expert Report Management"
            >
              <ExpertReportList />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Report Detail */}
      <Route
        path="/reports/detail"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["taskForce:can-get-complaint"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <ReportDetail />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-fill-form"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["expert:can-upload-investigation"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <ReportForm />
            </Main>
          </ProtectedRoute>
        }
      />
       <Route
        path="/report-update-form"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["expert:can-upload-investigation"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <ReportUpdateForm />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/expert_case_get/details"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["expert:can-upload-investigation"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <ExpertReportDetail />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Pollution Category Detail */}
      <Route
        path="/base-data/pollutioncategory/details"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <PollutionCategoryDetail />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Penality Category Detail */}
      <Route
        path="/base-data/penalty/details"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <PenaltyCategoryDetail />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* Penality Category Detail */}
      <Route                         
        path="/base-data/penalty-type"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <PenaltyCategoryList />
            </Main>
          </ProtectedRoute>
        }
      />
      {/* Zone Detail */}
      <Route
        path="/base-data/region_city/details"
        element={ <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>  
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <ZoneDetail />
            </Main>
         </ProtectedRoute>

        }
      />
      {/* Zone Detail */}
      <Route
        path="/subcity-region/details"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Details">
              <SubcityOrZoneDetail />
            </Main>
          </ProtectedRoute>
        }
      />
      {/* Results */}
      <Route
        path="/results"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Result List">
              <ResultsList />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* Stats */}
      <Route
        path="/stats"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Stats List">
              <StatsList />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/base-data/report-category"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Report Category Management"
            >
              <ReportCategoryList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/base-data/sub-category"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Report Sub Category Management"
            >
              <SubPollutionCategoryList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/task_force_case_get"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["taskForce:can-get-complaint"]}
          >
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Get Case Management"
            >
              <TaskForcecGetCase />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/task_force_report_list"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["taskForce:can-get-complaint"]}
          >
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Report Case Management"
            >
              <TaskForceReportList />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert_case_get"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["expert:can-get-case"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Get Case Management"
            >
              <ExpertGetCase />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/task_force_complaint_list"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Get Complaint List Management"
            >
              <TaskForcecComplaintList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/base-data/sound-area"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Sound Area">
              <SoundAreaList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/base-data/form-types"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Form Type">
              <FormTypesList />
            </Main>
          </ProtectedRoute>
        }
      />
      <Route
        path="/base-data/report-types"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Report Type">
              <ReportTypesList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="base-data/reporting-forms"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Reporting Forms">
              <ReportingFormsList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/base-data/awareness"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Awareness">
              <AwarenessList />
            </Main>
          </ProtectedRoute>
        }
      />

       <Route
        path="/base-data/news"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="News">
              <NewsList />
            </Main>
          </ProtectedRoute>
        }
      />

      <Route
        path="/base-data/address"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["BaseData:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Epa Office Location"
            >
              <AddressList />
            </Main>
          </ProtectedRoute>
        }
      />

      {/* REGIONAL WORKFLOW ROUTES  */}

      <Route
        path="/regional/region-admin"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Region Admin - Assignment"
            >
              <RegionAdminPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/regional/zone-admin"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Zone Admin - Assignment"
            >
              <ZoneAdminPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
         <Route
        path="/regional/zone-detail"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Zone Report Detail"
            >
              <ZoneDetailPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/regional/woreda-admin"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Woreda Admin - Assignment"
            >
              <WoredaAdminPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      
      <Route
        path="regional/woreda-detail"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Woreda Detail"
            >
              <WoredaDetailPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/regional/expert/cases"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="My Regional Cases">
              <RegionalExpertList />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
         <Route
        path="/desk-head/detail"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="DeskHead Cases">
              <DeskHeadDetail />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
         <Route
        path="/desk-head/reportlist"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="DeskHead Cases">
              <DeskHeadPage />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />


      <Route
        path="/regional/expert/case"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Regional Investigation Case"
            >
              <RegionalExpertCase />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/regional/results"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Regional Results & Archive"
            >
              <RegionalResultsList />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

        <Route
        path="reports/regional/detail"
        element={
          isLoggedIn ? (
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="Report Detail"
            >
              <RegionalReportDetail />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

  <Route

        path="/regional/review-investigation"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Review Investigation">
              <span />
              {/* RegionalReviewInvestigation */}
            </Main>
          ) : (
            <Navigate to="/" />
    )
  }
/>

 <Route
        path="/generalreport"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["Dashboard:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="General Report"
            >
              <GeneralReport />
            </Main>
          </ProtectedRoute>
        }
      />

 <Route
        path="/generaldashboard"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            permissions={permissions}
            requiredPermissions={["Dashboard:read"]}>
            <Main
              setIsLoggedIn={setIsLoggedIn}
              headerTitle="General Dashoard"
            >
              <GeneralDashboard />
            </Main>
          </ProtectedRoute>
        }
      />



      <Route
        path="/base-data/organization"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Organizational Structure">
              <Organization />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/base-data/form-report-types"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Form and Report Types">
              <FormAndReportTypes />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />
       <Route
        path="/base-data/rejection-reasons"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Rejection Reasons">
              <RejectionReasons />
            </Main>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* My Profile */}
      <Route
        path="/profile"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="My Profile">
              <ProfilePage />
            </Main>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          isLoggedIn ? (
            <Main setIsLoggedIn={setIsLoggedIn} headerTitle="Change Password">
              <ChangePasswordPage />
            </Main>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

  
<Route
  path="*"
  element={<NotFoundPage permissions={permissions} />}
/>


    </Routes>

    
  );
}
