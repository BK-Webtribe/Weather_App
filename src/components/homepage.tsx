import React, { useState, useEffect } from 'react';


interface HomePageProps {
  user: any;
  handleLogout: () => Promise<void>;
}
const HomePage: React.FC<HomePageProps> = ({ user, handleLogout }) =>
{

  return (
    <div className="box">
      <header>
        <h1>Welcome, {user.displayName}</h1>
        <button onClick={handleLogout}>Log Out</button>
      </header>
    </div>
  )
}

export default HomePage;
