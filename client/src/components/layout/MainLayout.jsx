import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
