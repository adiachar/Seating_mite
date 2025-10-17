import axios from 'axios';
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom';

export default function Allotment() {
    const examReq = useLocation().state.examReq;

    const getAllotment = async () => {
        try {
            let response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/exam/allotment/${examReq._id}`);

            if(response.status === 200) {
                console.log(response.data.allotment);
                setAllotment(response.data.allotment);
            }
        } catch(err) {
            console.log(err);
            alert("Something went wrong!");
        }
    }

    console.log(examReq);

    return (
        <div className='w-full p-2'>
            {examReq.allotment && examReq.allotment.map((allotted, idx) => 
                <div key={idx} className='my-2 p-2 border rounded flex flex-col'>
                    <div className='my-2 flex flex-wrap gap-3'>
                        <h1 className='px-2 bg-neutral-300 rounded'><span className='mr-2 font-semibold'>Building:</span>{allotted.building}</h1>
                        <h1 className='px-2 bg-neutral-300 rounded'><span className='mr-2 font-semibold'>Floor:</span>{allotted.floor}</h1>
                        <h1 className='px-2 bg-neutral-300 rounded'><span className='mr-2 font-semibold'>Class:</span>{allotted.classRoom.name}</h1>                        
                    </div>
                    <table className='border'>
                        <tbody className='divide-y'>
                            {allotted.classRoom.seats.map((row, rIdx) => 
                                <tr key={rIdx} className=''> 
                                    {row.map((student, cIdx) => 
                                        <td key={cIdx} className='p-2 border-r text-center'>
                                            <h1 >{student.usn}</h1>
                                        </td>
                                    )}
                                </tr>
                            )}
                        </tbody>
                        
                    </table>
                </div>
            )}
        </div>
    )
}
