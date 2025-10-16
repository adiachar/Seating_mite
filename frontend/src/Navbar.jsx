import axios from 'axios';
import { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHeader, setUser, setCollege } from './features/seatingSlice';

export default function Navbar() {
  const user = useSelector((state) => state.user);
  const college = useSelector(state => state.college);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async (token) => {
      const headers = {
        authorization: `Bearer ${token}`,
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/authorize`, {}, {headers});
        if(response.status === 200) {
          dispatch(setUser(response.data.user));
          dispatch(setHeader(token));            
        }        
      }
      catch(err) {
        console.log(err);
        navigate("/sign");
      }
    }

    if(!user) {
      const token = localStorage.getItem("token");
      validateToken(token);     
    }
  }, []);

  useEffect(() => {
    if(user?._id) {
      getCollege();      
    }
  }, [user]);

  const getCollege = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${user.college}`);
      if(response.status === 200) {
        dispatch(setCollege(response.data.college));
      }
    } catch(err) {
      console.log(err);
      alert("Got error from the server while getting the college data");
    }
  }

  return (
    <div>
      {user?._id && college._id ? <div className='navbar min-h-21 w-full px-5 py-3 flex items-center shadow shadow-gray-400 text-gray-800'>
        {user?.type === 'student' && 
        <div className='flex items-center gap-3'>
          <span 
            className="material-symbols-outlined p-2 bg-blue-600 text-white rounded-xl"
            style={{fontSize: "1.7rem"}}>
            import_contacts
          </span>
          <div className='flex flex-col gap-1'>
            <h1 className='font-semibold text-xl'>{college.shortName} - Student Portal</h1>
            <p className='text-sm text-gray-400 font-normal'>{college.name}</p>
          </div>
        </div>}
        {/* user?._id && <ul className='mr-2 flex gap-2 text-md cursor-pointer overflow-auto'>
          <li 
            className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'
            onClick={() => navigate("/")}
            >Home</li>
          {user?.type != 'student' && 
            <li 
              onClick={() => navigate("/all-requests")}
              className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'
              >All Requests</li>}
          {user?.type === 'admin' && 
            <>
              <li 
                onClick={() => navigate("/add-exam-request")}
                className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'
                >Add Exam Request
              </li>
              <li 
                onClick={() => navigate("/college-data")}
                className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'
                >College Data
              </li>
            </>
          }
          <li className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'>About</li>
          <li className='px-3 py-2 transition-all text-nowrap rounded-2xl hover:bg-black hover:text-white'>Help</li>
        </ul> */}
      </div> : null}
    </div>
  )
}
