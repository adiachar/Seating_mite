import {useEffect, useState} from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import {useSelector} from 'react-redux';

export default function AddNewExam({setRefresh, refresh}) {
    const [date, setDate] = useState('');
    const examTypes = useSelector(state => state.college.examTypes);
    const [type, setType] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if(examTypes) {
            setType(examTypes[0]);
        }
    }, [refresh]);

    const submitData = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(!date || !type) {
            alert("Please fill all the fields!");
            setLoading(false);
            return;
        }

        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/add`, {date, type});
            if(response.status === 200) {
                alert("Exam Added Successfully!");
                setLoading(false);
                setRefresh(r => !r);
            } else {
                alert("Something went wrong!");
                setLoading(false);
                setRefresh(r => !r);
            }            
        } catch (error) {
            console.log(error);
            alert(error.message);
            setLoading(false);
            setRefresh(r => !r);
        }
    }

    return (
        <div className='w-full mt-10 mb-6 p-5 bg-white border border-gray-300 rounded-2xl'>
            <h1 className='mb-2 text-center'>Add New Exam</h1>
            <form onSubmit={submitData} className='flex flex-col flex-wrap gap-3'>
                <label htmlFor="" className='flex flex-col self-start'>
                    Date of Exam
                    <input
                        className='min-w-50 mt-1 mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
                        type='date' name='date' required placeholder='Exter exam date' value={date} onChange={e => setDate(e.target.value)}/>                    
                </label>

                <label htmlFor="" className='flex flex-col self-start'>
                    Exam Type
                    <select 
                        className='min-w-50 mt-1 mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
                        type="text" name='type' required placeholder='Exam Type' value={type} onChange={e => setType(e.target.value)}>
                        {examTypes?.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>                    
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
