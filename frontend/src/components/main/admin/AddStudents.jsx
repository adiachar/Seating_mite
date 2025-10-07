import {useState} from 'react';
import ExelFileInput from '../ExelFileInput';
import { Button } from '@mui/material';
import axios from 'axios';

export default function AddStudents() {
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const submitData = async (e) => {
        e.preventDefault();
        setLoading(true);

        if(!data || data.length === 0) {
            alert("Please Choose a data!");
            setLoading(false);
            return;
        }
        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/students/add`, {data});
            if(response.status === 200) {
                alert("Data Submitted Successfully!");
                setLoading(false);
            }            
        } catch(err) {
            console.log(err);
            alert("Something went wrong!");
            setLoading(false);
            return;
        }
    }
    
    return (
        <div>
            <form onSubmit={e => submitData}>
                <h2>Please add all students file below</h2>
                <ExelFileInput data={data} setData={setData} />
                <Button type='submit' loading={loading}>Submit</Button>            
            </form>
        </div>
    )
}
