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
    <div className=''>
      {user?._id && college._id ? 
      <div className='navbar min-h-21 w-full px-5 py-3 flex items-center justify-between shadow shadow-gray-400 text-gray-800'>

        <div className='flex items-center gap-3'>
          <span 
            className="material-symbols-outlined p-2 bg-blue-600 text-white rounded-xl"
            style={{fontSize: "1.7rem"}}>
            import_contacts
          </span>
          <div className='flex flex-col gap-1'>
            <h1 className='font-semibold text-xl'>{college.shortName} - {user?.type == 'student' ? "Student Portal" : user?.type == 'admin' ? "Admin Portal" : 'Coordinator Portal'}</h1>
            <p className='text-sm text-gray-400 font-normal'>{college.name}</p>
          </div>
        </div>

        <div className='justify-self-end'>
          <button 
            onClick={() => {localStorage.clear(); dispatch(setUser({})); dispatch(setCollege({})); navigate('/sign')}}
            className='px-3 py-2 border rounded-xl '>
            Log out
          </button>
        </div>
      </div> : null}
    </div>
  )
}
