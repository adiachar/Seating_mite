import {useState} from 'react';
import { Button } from '@mui/material';
import axios from 'axios';
import {useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function AddNewExam() {
    const [year, setYear] = useState(2025);
    const examTypes = useSelector(state => state.college.examTypes);
    const [examType, setExamType] = useState(examTypes[0]);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const submitData = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(!year || !examType) {
            alert("Please fill all the fields!");
            setLoading(false);
            return;
        }

        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/exam/add`, {year, examType});
            if(response.status === 200) {
                alert("Exam Added Successfully!");
                setLoading(false);
            } else {
                alert("Something went wrong!");
                setLoading(false);
            }            
        } catch (error) {
            console.log(error);
            alert("Something went wrong!");
            setLoading(false);
        }
    }

    return (
        <div className='w-11/12 mx-auto mt-10 p-5 border border-gray-300 rounded shadow'>
            <form onSubmit={submitData} className='w-full flex flex-col flex-wrap gap-3 justify-center'>
                <label htmlFor="">
                    Year:
                    <input
                        min={2000}
                        max={2100} 
                        className='w-12/12 mb-3 p-2 border border-gray-300 rounded'
                        type='number' name='year' required placeholder='Year' value={year} onChange={e => setYear(e.target.value)}/>                    
                </label>

                <label htmlFor="">
                    Exam Type:
                    <select 
                        className='w-12/12 mb-3 p-2 border border-gray-300 rounded'
                        type="text" name='examType' required placeholder='Exam Type' value={examType} onChange={e => setExamType(e.target.value)}>
                        {examTypes.map((type, index) => (
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
