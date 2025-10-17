import { useSelector } from 'react-redux'
import { Button } from '@mui/material';
import {useEffect, useState} from 'react'
import axios from 'axios';
import ExelFileInput from './ExelFileInput';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BallotIcon from '@mui/icons-material/Ballot';

export default function ExamRequestCard({examReq, setRefresh, selectedExam, selectExam}) {
  const user = useSelector(state => state.user);
  const [addStudents, setAddStudents] = useState(false);
  const navigate = useNavigate();

  const deleteExamRequest = async () => {
    if(user.type === 'admin') {
      setDelLoading(true);
      try {
        let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/delete`, {examId: examReq._id});
        if(response.status === 200) {
          alert("Exam Request Deleted Successfully!");
          setRefresh(r => !r);
          setDelLoading(false);
        }       
      } catch(err) {
        console.log(err);
        alert("Something went wrong!");
        setDelLoading(false);
      }
    }
  }

  const getDate = (date) => {
    date = new Date(date);
    return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'});
  }

  return (
    <div onClick={() => selectExam(examReq)} className='w-full mb-2 p-5 border border-gray-300 rounded-2xl shadow hover:shadow-lg transition-al'>

      <div 
        className="w-50 mb-2 px-2 py-1 rounded-xl border-gray-300 text-white flex items-center justify-between cursor-pointer bg-blue-500"
        > <h1>{examReq.type} - {getDate(examReq.date)}</h1>
        {selectedExam?._id === examReq._id && 
        <span 
            className="material-symbols-outlined"
            style={{fontSize: "1.5rem"}}>
            check_circle
        </span>}
      </div>
      {examReq._id == selectedExam._id && <div className='w-full mt-3 p-2 flex gap-3 overflow-x-auto'>
          <button 
            className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white flex items-center gap-2'
            onClick={() => navigate('/view-exam-details', {state: {examReq: examReq}})}
            ><InfoIcon/> <p>View Details</p></button>
          {(user.type === 'admin' || user.type === 'coordinator') && (
            <button 
              className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white flex items-center gap-2'
              onClick={() => setAddStudents(as => !as)}
              ><PersonAddAlt1Icon/>Add Eligible Students</button>
          )}
          {(user.type === 'admin') && (
            <>
          <button 
              className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-red-700 hover:border-transparent hover:text-white flex items-center gap-2'
              onClick={() => deleteExamRequest()}
              ><DeleteIcon/>Delete Request</button>

              <button
                className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white flex items-center gap-2'
                onClick={() => navigate("/allot-seats", {state: {examReq: examReq}})}
              ><CheckCircleIcon/>Allot Seats</button>         
            </>
          )}
          {examReq.isAllotted && <button
                className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-green-600 hover:border-transparent hover:text-white flex items-center gap-2'
                onClick={() => navigate("/allotment", {state: {examReq: examReq}})}
              ><BallotIcon/>View Allotment</button>  }
      </div>}
      {((user.type === 'admin' || user.type === 'coordinator') && addStudents) && <AddEligibleStudents examReq={examReq}/>}
    </div>
  );
}




const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

function AddEligibleStudents({examReq}) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const allBranches = useSelector(state => state.college.departments);
  const [branch, setBranch] = useState(Object.keys(allBranches)[0]);
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitData = async (e) => {
      e.preventDefault();
      setLoading(true);

      if(!students || students.length === 0) {
          alert("Please Choose a student data (xml file)!");
          setLoading(false);
          return;
      }

      if(!branch || !semester || !subject) {
          alert("Please fill all the fields!");
          setLoading(false);
          return;
      }

      let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/add/eligible-students`, {branch, semester, subject, students, examId: examReq._id})
      .then(res => {
          setLoading(false);
          if(res.status === 200) {
              alert("Data Submitted Successfully!");
              setIsSubmitted(true);
          } else {
              alert("Something went wrong!");
          }
      }).catch(err => {
          console.log(err);
          alert("Something went wrong!");
          setLoading(false);
          return;
      });
  }

  return (
    <div className='w-full mt-5 p-5 border border-gray-300 rounded shadow'>
      <form onSubmit={submitData} className='w-12/12 flex flex-wrap gap-3'>

        <label className='w-full lg:w-2/12' htmlFor="">
          Branch
          <select  
            className='w-full mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
            required
            name='branch' 
            value={branch} 
            onChange={e => setBranch(e.target.value)}>
            {Object.keys(allBranches).map((branch, index) => (
              <option key={index} value={branch}>{branch}</option>
            ))}
          </select>          
        </label>

        <label className='w-12/12 lg:w-2/12' htmlFor="">
          Semester
          <select 
            className='w-full mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
            name='semester' 
            required 
            placeholder='Semester' 
            value={semester} 
            onChange={e => setSemester(e.target.value)}>
              {semesters.map((sem, idx) => <option key={idx} value={sem}>{sem}</option>)}
            </select>          
        </label>

        <label className='w-12/12 lg:w-2/12' htmlFor="">
          Subject
          <input
            className='w-full mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
            type='text' 
            name='subject' 
            required 
            placeholder='Suject for exam'
            value={subject} 
            onChange={e => setSubject(e.target.value)}/>          
        </label>

        <label className="w-12/12 lg:w-5/12" htmlFor="">
          Eligible Students (.xml)
          <ExelFileInput setData={setStudents} />
        </label>
        
        <div className='w-12/12 flex items-center'>
          <Button 
            type='submit'  
            disabled={isSubmitted} 
            loading={loading}
            variant='outlined' 
            color="dark" 
            sx={{
              padding: "0.3rem 0.5rem",
              textTransform: "capitalize",
              borderRadius: "1rem",
              color: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "none",
              ":hover": {backgroundColor: "#16A34A", color: "white"}
            }}
            >Submit</Button>            
        </div>
      </form>
    </div>
  )
}