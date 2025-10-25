import {useEffect, useState} from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {useAlert} from '../../../AlertContext';

export default function AddNewExam({setRefresh, refresh}) {
    const [date, setDate] = useState('');
    const examTypes = useSelector(state => state.college.examTypes);
    const [type, setType] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {showAlert} = useAlert();
    const headers = useSelector(state => state.headers);

    useEffect(() => {
        if(examTypes) {
            setType(examTypes[0]);
        }
    }, [refresh]);

    const submitData = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(!date || !type) {
            showAlert("Please fill all the fields!", "error");
            setLoading(false);
            return;
        }

        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/add`, {date, type}, {headers});
            if(response.status === 200) {
                showAlert("Exam Added Successfully!", "success");
                setLoading(false);
                setRefresh(r => !r);
            } else {
                showAlert("Something went wrong!", "error");
                setLoading(false);
                setRefresh(r => !r);
            }            
        } catch (error) {
            console.log(error);
            showAlert(error.response.data.message, "error");
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
                            fontSize: "small",
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
