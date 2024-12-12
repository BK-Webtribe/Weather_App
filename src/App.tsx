import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GoogleAuth from './components/loginPage'; // Adjust the path if needed
import HomePage from './components/homepage'; // Match the file name exactly

function App() {
  const handleLogout = async () => {
    console.log('User logged out');
  };

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<GoogleAuth />} />
          <Route
            path="/homepage"
            element={<HomePage user={undefined} handleLogout={handleLogout} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
