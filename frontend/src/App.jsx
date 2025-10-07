import { useState } from 'react';
import './App.css';
import {Routes, Route, Router} from 'react-router-dom';
import Sign from './components/user/Sign';
import { Provider } from 'react-redux';
import {store} from './app/store';
import AllRequests from './components/main/AllRequests';
import Navbar from './components/main/Navbar';
import ExamRequest from './components/main/ExamRequest';
import AdminPage from './components/main/admin/AdminPage';
import AddNewExam from './components/main/admin/AddNewExam';
import ViewExamDetails from './components/main/ViewExamDetails';
import AllotSeats from './components/main/admin/AllotSeats';
import CollegeData from './components/main/admin/CollegeData';

function App() {
  
  return (
    <div className="App">
      <Provider store={store}>
        <Navbar/>
          <Routes>
            <Route path='/*' element={<div>Home</div>} />
            <Route path='all-requests' element={<AllRequests/>} />
            <Route path="/sign" element={<Sign/>} />
            <Route path="/exam-request" element={<ExamRequest/>} />
            <Route path="/add-exam-request" element={<AddNewExam/>} />
            <Route path='/view-exam-details' element={<ViewExamDetails/>}/>
            <Route path='/allot-seats' element={<AllotSeats/>}/>
            <Route path='/college-data' element={<CollegeData/>}/>
          </Routes>            
      </Provider>
    </div>
  )
}

export default App
