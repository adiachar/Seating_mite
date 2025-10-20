import './App.css';
import {Routes, Route, Router} from 'react-router-dom';
import Sign from './components/user/Sign';
import { Provider } from 'react-redux';
import {store} from './app/store';
import AllRequests from './components/main/AllRequests';
import Navbar from './Navbar';
import AddNewExam from './components/main/admin/AddNewExam';
import ViewExamDetails from './components/main/ViewExamDetails';
import AllotSeats from './components/main/admin/AllotSeats';
import CollegeData from './components/main/admin/CollegeData';
import Allotment from './components/main/Allotment';
import Home from './components/main/Home';
import { AlertProvider } from './AlertContext';

function App() {

  return (
    <div className="App h-screen p-0 m-0 flex flex-col">
      <Provider store={store}>
        <AlertProvider>
          <div className='min-h-10 w-full bg-neutral-800'></div>
          <Navbar/>
          <div className='h-full'>
            <Routes>
              <Route path='/*' element={<Home/>} />
              <Route path='all-requests' element={<AllRequests/>} />
              <Route path="/sign" element={<Sign/>} />
              <Route path="/add-exam-request" element={<AddNewExam/>} />
              <Route path='/view-exam-details' element={<ViewExamDetails/>}/>
              <Route path='/allot-seats' element={<AllotSeats/>}/>
              <Route path='/college-data' element={<CollegeData/>}/>
              <Route path='/allotment' element={<Allotment/>}/>
            </Routes>            
          </div>          
        </AlertProvider>
      </Provider>
    </div>
  )
}

export default App
