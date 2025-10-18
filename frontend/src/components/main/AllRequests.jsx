import { useState, useEffect } from 'react';
import RequestCard from './ExamRequestCard';
import axios from 'axios';
import { useAlert } from "../../AlertContext";

export default function AllRequests() {
  const [allExams, setAllExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const {showAlert} = useAlert();

  useEffect(() => {
    const getAllExams = async () => {
        setLoading(true);
        try {
            let response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/exam/all`);

            if(response.status === 200) {
                setAllExams(response.data.exams);
                setLoading(false);
            }
        } catch(error) {
            console.log(error);
            showAlert("Something went wrong!", "error");
            setLoading(false);
        }
    }
    getAllExams();
  },[refresh]);

  return (
    <div className='w-full p-5 flex flex-col gap-5'>
      {loading ? <p>Loading...</p> : allExams.length === 0 ? <p>No Exams Found!</p> : (
        allExams.map((examReq, index) => (
          <div key={index}>
            <RequestCard key={index} examReq={examReq} setRefresh={setRefresh}/>
          </div>
        ))
      )}
    </div>
  );
}
