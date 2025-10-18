import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';



export default function ViewExamDetails() {
    const examRequest = useLocation().state.examReq;
    const [examReq, setExamReq] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getEligibleStudents = async (examRequest) => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/exam/eligible-students/${examRequest._id}`);
                if(response.status === 200) {
                    setExamReq(er => { return {...examRequest, eligibleStudents: response.data.eligibleStudents}});
                }                
            } catch(err) {
                console.log(err);
            }
        }

        if(examRequest._id) {
            getEligibleStudents(examRequest);
        } else {
            navigate('/all-requests');
        }
    }, []);

    

    return (
        <div className='w-full p-5'>
            {examReq ? <div className='p-2 border border-neutral-400 rounded'>
                <ul className='mb-2 flex flex-col lg:flex-row md:flex-row'>
                    <li className='me-2 px-2 bg-neutral-300 rounded text-sm'>
                        <span className='font-bold'>Exam Type: </span>{examReq.examType}</li>
                    <li className='me-2 px-2 bg-neutral-300 rounded text-sm'>
                        <span className='font-bold'>Year: </span>{examReq.year}</li>
                </ul>
                <h2 className='my-2 block text-center text-xl text-neutral-600 font-extrabold'>Eligible Students:</h2>
                <ul>
                    {examReq.eligibleStudents.map((elStudents, idx) => 
                        <li key={idx} className='p-2 mb-2 border rounded'>
                            <div>
                                <div className='mb-2 flex flex-wrap gap-2'>
                                    <p className='px-2 bg-neutral-300 rounded inline font-bold'>
                                        Branch:
                                        <span className='px-1 font-normal'>{elStudents.branch}</span>
                                    </p>
                                    <p className='px-2 bg-neutral-300 rounded inline font-bold'>
                                        Semester:
                                        <span className='px-1 font-normal'>{elStudents.semester}</span>
                                    </p>
                                    <p className='px-2 bg-neutral-300 rounded inline font-bold'>
                                        Batch:
                                        <span className='px-1 font-normal'>{elStudents.batch}</span>
                                    </p>
                                </div>
                                <ul className='max-h-100 p-2 bg-neutral-200  overflow-y-auto'>
                                    {elStudents.students.map((student, idx) => 
                                        <li key={idx}>{student}</li>
                                    )}
                                </ul>
                            </div>
                        </li>
                    )}
                </ul>
            </div>: <></>}      
        </div>
    );
}
