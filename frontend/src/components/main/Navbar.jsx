import axios from 'axios';
import { useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setHeader, setUser } from '../../features/seatingSlice';

export default function Navbar() {
  const user = useSelector((state) => state.user);
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

  return (
    <div className='navbar px-5 py-3 flex justify-end bg-neutral-200'>
      {user?._id && <ul className='mr-2 flex gap-2 text-md cursor-pointer'>
        <li 
          className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'
          onClick={() => navigate("/")}
          >Home</li>
        {user?.type != 'student' && 
          <li 
            onClick={() => navigate("/all-requests")}
            className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'
            >All Requests</li>}
        {user?.type === 'admin' && 
          <>
            <li 
              onClick={() => navigate("/add-exam-request")}
              className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'
              >Add Exam Request
            </li>
            <li 
              onClick={() => navigate("/college-data")}
              className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'
              >College Data
            </li>
          </>
        }
        <li className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'>About</li>
        <li className='px-3 py-2 hover:bg-neutral-400 rounded transition-colors'>Help</li>
      </ul>}
    </div>
  )
}
