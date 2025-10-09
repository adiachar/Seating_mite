import { useSelector } from 'react-redux'
import { Button } from '@mui/material';
import {useState} from 'react'
import axios from 'axios';
import ExelFileInput from './ExelFileInput';
import { useNavigate } from 'react-router-dom';

export default function ExamRequestCard({examReq, setRefresh}) {
  const user = useSelector(state => state.user);
  const [addStudents, setAddStudents] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const navigate = useNavigate();

  const deleteExamRequest = async () => {
    if(user.type === 'admin') {
      setDelLoading(true);
      try {
        let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/delete`, {examId: examReq._id});
        if(response.status === 200) {
          alert("Exam Request Deleted Successfully!");
          setRefresh(r => !r);
        }       
      } catch(err) {
        console.log(err);
        alert("Something went wrong!");
      }
    }
  }

  return (
    <div className='w-full p-5 border border-gray-300 rounded shadow hover:shadow-lg transition-shadow'>
        <h3 className='py-1 px-2 font-semibold rounded bg-neutral-300 inline'>{examReq.examType} - {examReq.year}</h3>
        <div className='mt-3 flex gap-3 overflow-x-auto'>
            <button 
              className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-nowrap'
              onClick={() => navigate('/view-exam-details', {state: {examReq: examReq}})}
              >View Details</button>
            {(user.type === 'admin' || user.type === 'coordinator') && (
              <button 
                className='px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-nowrap'
                onClick={() => setAddStudents(as => !as)}
                >Add Eligible Students</button>
            )}
            {(user.type === 'admin') && (
              <>
                <Button
                  variant='outlined' 
                  color='error'
                  size='small'
                  loading={delLoading}
                  onClick={() => deleteExamRequest()}
                  >Delete Request</Button>

                <Button
                variant='outlined' 
                color='dark'
                size='small'
                loading={delLoading}
                onClick={() => navigate("/allot-seats", {state: {examReq: examReq}})}
                >Allot Seats</Button>

                <Button
                variant='outlined' 
                color='dark'
                size='small'
                loading={delLoading}
                onClick={() => navigate("/allotment", {state: {examReq: examReq}})}
                >View Allotment</Button>           
              </>
            )}
        </div>
        {((user.type === 'admin' || user.type === 'coordinator') && addStudents) && <AddEligibleStudents examReq={examReq}/>}
    </div>
  );
}

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

function AddEligibleStudents({examReq}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const allBranches = useSelector(state => state.college.branches);
  const [branch, setBranch] = useState(allBranches[0]);
  const [semester, setSemester] = useState(1);
  const [batch, setBatch] = useState(2025);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitData = async (e) => {
      e.preventDefault();
      setLoading(true);

      if(!data || data.length === 0) {
          alert("Please Choose a data!");
          setLoading(false);
          return;
      }

      if(!branch || !semester || !batch) {
          alert("Please fill all the fields!");
          setLoading(false);
          return;
      }

      let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/add/eligible-students`, {branch, semester, batch, data, examId: examReq._id})
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
      <form onSubmit={submitData} className='w-12/12 flex flex-col lg:flex-row flex-wrap gap-3'>

        <label className='w-12/12 lg:w-2/12' htmlFor="">
          Branch:
          <select  
            className='w-full mb-3 p-2 border border-gray-300 rounded'
            required
            name='branch' 
            value={branch} 
            onChange={e => setBranch(e.target.value)}>
            {allBranches.map((branch, index) => (
              <option key={index} value={branch}>{branch}</option>
            ))}
          </select>          
        </label>

        <label className='w-12/12 lg:w-2/12' htmlFor="">
          Semester:
          <select 
            className='w-full min-w-3/10 mb-3 p-2 border border-gray-300 rounded'
            name='semester' 
            required 
            placeholder='Semester' 
            value={semester} 
            onChange={e => setSemester(e.target.value)}>
              {semesters.map((sem, idx) => <option key={idx} value={sem}>{sem}</option>)}
            </select>          
        </label>

        <label className='w-12/12 lg:w-2/12' htmlFor="">
          Batch:
          <input
            className='w-full min-w-4/10 mb-3 p-2 border border-gray-300 rounded'
            type='number' 
            name='batch' 
            required 
            placeholder='Batch'
            min={2000}
            max={2100}
            value={batch} 
            onChange={e => setBatch(e.target.value)}/>          
        </label>

        <label className="w-12/12 lg:w-5/12" htmlFor="">
          Upload Eligible Students Exel File:
          <ExelFileInput data={data} setData={setData} />
        </label>
        
        <div className='w-12/12 flex items-center'>
          <Button 
            type='submit'  
            disabled={isSubmitted} 
            loading={loading}
            variant='outlined' 
            color="dark" 
            sx={{
                padding: "0.5rem 3rem",
                backgroundColor: "#142424",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "none",
            }}
            >Submit</Button>            
        </div>
      </form>
    </div>
  )
}