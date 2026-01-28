import React from "react";
import Navbar from "../shareable/Navbar";

const ScheduledJobsPage: React.FC = () => {
  return (
    <>
      <Navbar activeTab="scheduled-jobs" />
      <div className="container-fluid mt-0 p-1 mr-[10px]">
        <p>This is Scheduled Jobs content.</p>
      </div>
    </>
  );
};

export default ScheduledJobsPage;
