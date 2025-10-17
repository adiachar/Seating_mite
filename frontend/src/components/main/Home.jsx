import axios from "axios";
import { useEffect, useState } from "react";
import {useSelector} from "react-redux";
import AddNewExam from "./admin/AddNewExam";
import ExamRequestCard from "./ExamRequestCard";
import CollegeData from "./admin/CollegeData";

export default function Home() {
    const user = useSelector(state => state.user);
    const college = useSelector(state => state.college);
    const [allExams, setAllExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState({});
    const [allotment, setAllotment] = useState({});
    const [loading, setLoading] = useState(false);
    const [classRoom, setClassRoom] = useState([[]]);
    const [refresh, setRefresh] = useState(false);


    useEffect(() => {
        getAllExams();
    }, [refresh]);

    const getAllExams = async () => {
        setLoading(true);

        try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/exam/all`);
        if(response.status === 200) {
            let allExams = [];

            for(let currExam of response.data.exams) {
                let allotment = await getAllotment(currExam);
                allExams.push({...currExam, allotment: allotment});
            }
            setAllExams([...allExams]);
            setLoading(false);
        }

        } catch(err) {
            setLoading(false);
            console.log(err);
            alert("Got error from the server while getting the college data!");
        }
    }

    const getAllotment = async (currExam) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/exam/allotment/${currExam._id}`);
        if(response.status === 200) {
            return response.data.allotment;
        }
        
        } catch(err) {
            console.log(err);
            alert("Got error from the server while getting the college data");
            return [];
        }
    }

    const selectExam = async (ex) => {
        setSelectedExam({...ex});

        if(user?.type === 'student'){    
            for(let classIdx = 0; classIdx < ex.allotment.length; classIdx++) {
                let place = ex.allotment[classIdx];
                let seats = place.classRoom.seats;
                for(let i = 0; i < seats.length; i++) {
                    for(let j = 0; j < seats[i].length; j++) {
                        if(place.classRoom.seats[i][j].usn.toLowerCase() == user.usn.toLowerCase()) {
                            setAllotment({building: place.building, classRoom: place.classRoom, floor: place.floor, row: i, column: j, classIdx: classIdx, info: place.classRoom.seats[i][j]});
                            setLoading(false);
                            setClassRoom(seats);
                            return;
                        }
                    }
                }
            }
        }
    }

    const getDate = (date) => {
        date = new Date(date);
        return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'});
    }

    return (
        <div className='h-full w-full px-6 py-10 overflow-auto bg-gradient-to-br from-blue-100 text-gray-800'>
            {user && <div className="mb-5 flex flex-col gap-2 justify-center">
                <h1 className="text-2xl font-semibold capitalize text-blue-600">Welcome, {user.name}!</h1>
                <p className="text-gray-700">{user.type === 'student' ? "Here's your seating information" : "Hears's your dashboard. Please read the instructions before proceeding"}</p>
            </div>}

            {user && user.type == 'student' && college?._id && 
            <div className="mb-6 mt-9 p-5 border border-gray-300 bg-white rounded-2xl flex flex-col gap-3">
                <div className="w-full flex gap-3">
                    <div className="h-15 w-15 p-4 rounded-full bg-blue-600 flex items-center justify-center text-2xl text-white font-normal">
                        <h1 className="uppercase">{user.name.slice(0, 2)}</h1>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="capitalize font-semibold text-lg">{user.name}</h1>
                        <p>{user.usn.toUpperCase()}</p>
                    </div>                    
                </div>

                <div className="mt-8">
                    <ul>
                        <li className="mb-3 flex items-center gap-2 text-gray-600">
                            <span 
                                className="material-symbols-outlined"
                                style={{fontSize: "1.3rem"}}>
                                domain
                            </span>
                            <p>{college.departments[user.department]}</p>
                        </li>

                        <li className="mb-3 flex items-center gap-2 text-gray-600">
                            <span 
                                className="material-symbols-outlined"
                                style={{fontSize: "1.3rem"}}>
                                import_contacts
                            </span>
                            <p>{user.semester} - Semester</p></li>

                        <li className="mb-3 flex items-center gap-2 text-gray-600">
                            <span 
                                className="material-symbols-outlined"
                                style={{fontSize: "1.3rem"}}>
                                call
                            </span>
                            +91-{user.phoneNo}</li>
                    </ul>
                </div>
            </div>}

            {user?.type === 'admin' && <AddNewExam setRefresh={setRefresh} refresh={refresh}/>}

            {!loading ? <div className="mb-6 p-5 border border-gray-300 bg-white rounded-2xl flex flex-col gap-3">
                <h1>Select the Exam:</h1> 
                <div>
                    {allExams.length > 0 ? allExams.map((ex, idx) => 
                        <ExamRequestCard key={idx} examReq={ex} setRefresh={setRefresh} selectedExam={selectedExam} selectExam={selectExam}/> 
                    ) : <p>No Exams!</p>}
                </div>
            </div> : <h1>Loading...</h1>}

            {user?.type === 'student' && allotment?.building && <div className="min-h-50 mb-6 p-5 bg-white rounded-2xl text-white flex flex-col gap-3 bg-gradient-to-br from-blue-600 to-purple-600">
                <div className="flex items-center gap-3 text-xl font-semibold ">
                    <span 
                        className="material-symbols-outlined"
                        style={{fontSize: "1.8rem"}}>
                        check_circle
                    </span>
                    <h1>Current Seat Assignment</h1>                    
                </div>

                <div className="w-full my-6 flex gap-5">
                    <div className="lg:w-1/2 w-full flex flex-col gap-5">
                        <div className="flex flex-col">
                            <h1 className="text-gray-200">Allotted Place</h1>
                            <p className="text-white">{allotment.building} - {allotment.classRoom.name}</p>
                        </div>
                        <div>
                            <h1 className="text-gray-200">Date</h1>
                            <p className="text-white">{getDate(selectedExam.date)}</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full flex flex-col gap-5">
                        <div>
                            <h1 className="text-gray-200">Subject</h1>
                            <p className="text-white capitalize">{allotment.info.subject}</p>
                        </div>
                        <div>
                            <h1 className="text-gray-200">Seat Position</h1>
                            <p className="text-white">Row {allotment.row}, Column {allotment.column}</p>
                        </div>
                    </div>
                </div>
            </div>}

            {user?.type === 'student' && allotment?.building && 
            <div className="mb-6 p-5 border border-gray-300 bg-white rounded-2xl flex flex-col gap-3">
                <div className="p-2 border-b border-gray-300 text-gray-800">ClassRoom: {allotment.classRoom.name}</div>
                <div 
                    style={{gridTemplateRows: `repeat(${allotment.classRoom.rows}, 1fr)`, gridTemplateColumns: `repeat(${allotment.classRoom.columns}, 1fr)`}}
                    className="grid gap-2 overflow-auto">
                        {classRoom.map((row, rIdx) => 
                            row.map((obj, cIdx) => 
                            <div 
                                key={`${rIdx}${cIdx}`} 
                                className={`px-2 py-3 text-sm rounded-lg ${rIdx === allotment.row && cIdx === allotment.column ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}

                                >{obj.usn}</div>))
                        }
                </div>
            </div>}


            {user?.type === 'admin' && <div className="mb-6 bg-white rounded-2xl border border-gray-300">
                <CollegeData setRefresh={setRefresh}/>
            </div>}
            
            <div className="mb-6 p-5 border border-gray-300 bg-white rounded-2xl flex flex-col gap-3">
                <h1 className="text-xl font-semibold">Important Instructions</h1>
                <ul className="mt-7">
                    <li className="mb-3 flex items-center gap-3">
                        <span className="h-7 w-7 flex justify-center items-center bg-blue-600/10 text-blue-600 rounded-full">
                            1
                        </span>
                        <p>Please arrive at least 15 minutes before the scheduled time.</p>
                    </li>
                    <li className="mb-3 flex items-center gap-3">
                        <span className="h-7 w-7 flex justify-center items-center bg-blue-600/10 text-blue-600 rounded-full">
                            2
                        </span>
                        <p>Bring your college ID card and admit card for verification.</p>
                    </li>
                    <li className="mb-3 flex items-center gap-3">
                        <span className="h-7 w-7 flex justify-center items-center bg-blue-600/10 text-blue-600 rounded-full">
                            3
                        </span>
                        <p>Proceed directly to your assigned seat. Do not change seats without permission.</p>
                    </li>
                    <li className="mb-3 flex items-center gap-3">
                        <span className="h-7 w-7 flex justify-center items-center bg-blue-600/10 text-blue-600 rounded-full">
                            4
                        </span>
                        <p>Mobile phones and electronic devices are not permitted in the examination hall.</p>
                    </li>
                </ul>
            </div>
        </div>
    )
}
