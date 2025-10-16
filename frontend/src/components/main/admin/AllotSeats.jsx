import { Button } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

let batchTable = [];

export default function AllotSeats() {
    const [college, setCollege] = useState(null);
    const examRequest = useLocation().state.examReq;
    const [examReq, setExamReq] = useState(null);
    const user = useSelector(state => state.user);
    const [noOfBatch, setNoOfBatch] = useState(2);
    const [noOfStudentCategories, setNoOfStudentCategories] = useState(0);

    const getCollegeData = async () => {
        if(!user) {
            return;
        }

        try {
            const collegeId = user.college;
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${collegeId}`);

            if(response.status === 200) {

                let currentCollege = response.data.college;
                currentCollege.buildings = currentCollege.buildings.map(building => 
                    {return {...building, isSelected: false, floors: building.floors.map(floor => 
                        {return {...floor, isSelected: false, classRooms: floor.classRooms.map(classRoom => 
                            {return {...classRoom, isSelected: false, seats: Array.from({length: classRoom.rows}, () => Array(classRoom.columns).fill(0))}})}})}});

                setCollege(currentCollege);
                
            }
        } catch(err) {
            console.log(err);
        }
    }

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

    useEffect(() => {
        getCollegeData();
        if(examRequest._id) {
            getEligibleStudents(examRequest);
            
        } else {
            navigate('/all-requests');
        }
    }, []);

    useEffect(() => {
        if(examReq) {
            setNoOfStudentCategories(examReq.eligibleStudents.length);
        }
    }, [examReq]);

    const handleBuildingSelection = (e, bIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].isSelected = !updatedCollege.buildings[bIdx].isSelected;

        if(!updatedCollege.buildings[bIdx].isSelected) {
            updatedCollege.buildings[bIdx].floors = updatedCollege.buildings[bIdx].floors.map(floor => 
                        {return {...floor, isSelected: false, classRooms: floor.classRooms.map(classRoom => 
                            {return {...classRoom, isSelected: false}})}})
        }
        
        setCollege({...updatedCollege});
    }

    const handleFloorSelection = (e, bIdx, fIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].isSelected = !updatedCollege.buildings[bIdx].floors[fIdx].isSelected;

        if(!updatedCollege.buildings[bIdx].floors[fIdx].isSelected) {
            updatedCollege.buildings[bIdx].floors[fIdx].classRooms = updatedCollege.buildings[bIdx].floors[fIdx].classRooms.map(classRoom =>  
                {return {...classRoom, isSelected: false}})

        }
        setCollege({...updatedCollege});
    }

    const handleClassRoomSelection = (e, bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].isSelected = e.target.checked;
        setCollege({...updatedCollege});
    }

    const createBatch = () => {
        let stdCategory = examReq.eligibleStudents.map((elStd) => {return {batch: `${elStd.branch}-${elStd.semester}`, students: elStd.students}});
        let eachBatchSize = parseInt(( stdCategory.length / noOfBatch ) + ( stdCategory.length % noOfBatch ));
        let batches = Array.from({length: noOfBatch}, (_) => Array());
        
        let startIdx = 0;
        for(let i = 0; i < noOfBatch - 1; i++) {
            batches[i].push(...stdCategory.slice(startIdx, (startIdx + eachBatchSize)));
            startIdx += eachBatchSize;
        }
        batches[noOfBatch - 1].push(...stdCategory.slice(startIdx, stdCategory.length));
        
        for(let i = 0; i < batches.length; i++) {

            let updatedBatch = [];
            for(let stdCat of batches[i]) {
                updatedBatch = [...updatedBatch, ...stdCat.students];
            }

            batches[i] = updatedBatch;
        }
        
        let batchLengths = batches.map((batch) => batch.length);
        let maxBatchSize = Math.max(...batchLengths);

        batchTable = [];

        for(let j = 0; j < maxBatchSize; j++) {
            let newRow = [];
            for(let i = 0; i < batches.length; i++) {
                newRow.push(batches[i][j]);
            }
            batchTable.push(newRow);
        }
    }

    const allotSeat = () => {
        createBatch();
        
        let updatedCollege = college;
        let btr = Array(batchTable[0].length).fill(0);
        let btc = 0;

        for(let building of updatedCollege.buildings) {
            if(building.isSelected) {
                for(let floor of building.floors) {
                    if(floor.isSelected) {
                        for(let room = 0; room < floor.classRooms.length; room++) {
                            if(floor.classRooms[room].isSelected) {
                                let seats = floor.classRooms[room].seats;
                                for(let j = 0; j < floor.classRooms[room].columns; j++) {
                                    if(btc >= noOfBatch) {
                                        btc = 0;
                                    }
                                    
                                    for(let i = 0; i < floor.classRooms[room].rows; i++) {
                                        seats[i][j] = (btr[btc] < batchTable.length && batchTable[btr[btc]][btc]) ? batchTable[btr[btc]++][btc] : 0;
                                    }
                                    btc++;
                                }
                                floor.classRooms[room].seats = seats;
                            }
                        }                         
                    }
                   
                }
            }
        }

        setCollege({...updatedCollege});
    }

    const finalizeAllotment = async () => {
        let allotment = [];

        for(let building of college.buildings) {
            if(building.isSelected) {
                for(let floor of building.floors) {
                    if(floor.isSelected) {
                        for(let classRoom of floor.classRooms) {
                            if(classRoom.isSelected) {
                                delete classRoom.isSelected;
                                delete classRoom._id;
                                allotment.push({building: building.name, floor: floor.name, classRoom: classRoom});
                            }
                        }                        
                    }
                }                
            }
        }

        try {
            let response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/exam/allotment`, {examId: examReq, allotment});

            if(response.status == 200) {
                alert("Seats Alloted Successfully!");
            }
            
        } catch(err) {
            console.log(err);
            alert("Something went wrong!");
        }
    }
    
    return (
        <div className="w-full flex flex-col items-center">
            {college? 
                <div className="w-full p-5">
                    <h1 className="font-semibold text-xl text-center text-gray-500">Select available classes in college</h1>
                    
                    <div className="mt-5 p-4 rounded-2xl border border-gray-200">
                        <h1 className="p-2 text-center text-gray-600 font-semibold bg-gray-300">Buildings</h1>
                        {college.buildings.map((building, bIdx) => 
                            <div key={bIdx} className="mt-5">
                                <button
                                    className={`px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white ${building.isSelected && 'bg-black text-white rounded-b-none'}`}
                                    onClick={(e) => handleBuildingSelection(e, bIdx)}
                                    >{building.name}
                                </button>
                                
                                {building.isSelected && 
                                    <div className="p-2 border rounded-b-2xl">    
                                        <h1 className="p-2 text-center text-gray-600 font-semibold bg-gray-300">Floors</h1>
                                        {building.floors.map((floor, fIdx) => 
                                            <div key={fIdx} className="mt-2">
                                                <button 
                                                    className={`px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white ${floor.isSelected && 'bg-black text-white rounded-b-none'}`}
                                                    onClick={(e) => handleFloorSelection(e, bIdx, fIdx)}
                                                    >{floor.name}</button>

                                                {floor.isSelected &&
                                                    <div className='w-full mb-5 p-5 grid grid-cols-4 gap-5 place-items-center border border-neutral-500 rounded-b-2xl overflow-auto'>
                                                        {floor.classRooms.map((classRoom, cRIdx) => 
                                                            <div key={cRIdx}>
                                                                <label htmlFor={`${bIdx}${fIdx}${cRIdx}`} className="px-3 py-2 bg-gray-300 rounded flex items-center">
                                                                    {classRoom.name} 
                                                                    <input 
                                                                        className="ml-2 size-5 accent-black"
                                                                        id={`${bIdx}${fIdx}${cRIdx}`}
                                                                        type="checkbox"
                                                                        checked={classRoom.isSelected}
                                                                        onChange={(e) => handleClassRoomSelection(e, bIdx, fIdx, cRIdx)}/>  
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>   
                                                }

                                            </div>

                                        )}
                                    </div>    
                                }                                    
                                
                            </div>

                        )}                            
                    </div>
                    <div className="my-5 p-5 flex flex-col gap-2 overflow-auto border border-gray-600 rounded-2xl">
                        <div className="w-fulls flex items-center gap-3">
                            <h1>Number of branches for each Class:</h1>
                            <div className="flex items-center">
                                <Button 
                                sx={{
                                    minWidth: "auto",
                                    padding: "0.4rem",
                                    backgroundColor: "black", 
                                    color: "white",
                                    borderRadius: "1rem"
                                }}
                                size="small" 
                                variant="contained" 
                                onClick={() => setNoOfBatch(n => n - 1 >= 1 ? n - 1 : 1)}
                                ><RemoveIcon sx={{fontSize: "1rem"}}/></Button>

                                <h1 className="mx-2 px-4 py-2 text-xl bg-gray-200 rounded-2xl">{noOfBatch}</h1>

                                <Button 
                                    sx={{
                                        minWidth: "auto",
                                        padding: "0.4rem",
                                        backgroundColor: "black", 
                                        color: "white",
                                        borderRadius: "1rem"
                                    }}
                                    size="small" 
                                    variant="contained" 
                                    onClick={() => setNoOfBatch(n => n + 1 <= noOfStudentCategories ? n + 1 : noOfStudentCategories)}
                                    ><AddIcon sx={{fontSize: "1rem"}}/></Button> 
                            </div>
                            
                        </div>
                        <div className="flex gap-2">
                           <button
                                className='w-auto px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white inline-block'
                                onClick={allotSeat} variant="outlined" color="success">Allot Seats</button>
                            <button
                                className='px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-green-600 hover:border-transparent hover:text-white flex items-center gap-2'
                                onClick={finalizeAllotment} variant="contained" color="success">Finalize Allotment</button> 
                        </div>
                        
                    </div>
                    <div>
                        <h1 className="font-semibold text-xl text-center text-gray-500">Selected classes for Allotment</h1>
                        <div className="border border-gray-200">
                            {college.buildings.map((building, bIdx) => 
                                (building.isSelected ? 
                                    building.floors.map((floor, fIdx) => 
                                        (floor.isSelected ?
                                            floor.classRooms.map((classRoom, cRIdx) => 
                                                (classRoom.isSelected ? 
                                                    (<div key={`${bIdx}${fIdx}${cRIdx}`} className="mb-2 p-2 border rounded">
                                                        <div className="flex flex-wrap gap-2">
                                                            <p 
                                                                className="px-2 py-1 font-bold bg-neutral-300 inline rounded"
                                                                >ClassRoom: 
                                                                <span className="font-normal">{classRoom.name}</span>
                                                            </p>
                                                            <p 
                                                                className="px-2 py-1 font-bold bg-neutral-300 inline rounded"
                                                                >Row: 
                                                                <span className="font-normal">{classRoom.rows}</span>
                                                            </p>
                                                            <p 
                                                                className="px-2 py-1 font-bold bg-neutral-300 inline rounded"
                                                                >Column: 
                                                                <span className="font-normal">{classRoom.columns}</span>
                                                            </p>
                                                        </div>
                                                        <div 
                                                            className={`w-full mt-3 grid row-auto gap-2 place-items-center overflow-auto`}
                                                            style={{gridTemplateColumns: `repeat(${classRoom.columns}, auto)`}}>
                                                            {classRoom.seats.map( row => row.map((col, idx) => <div key={idx} className="w-full p-5 bg-neutral-200">{col == 0 ? '-' : col}</div>))}
                                                        </div>
                                                    </div>) : null
                                                )   
                                            ) : null
                                        )
                                    ) : null
                                )
                            )}
                            
                        </div>
                    </div>   
                </div>         
            : <p>No Rooms Available</p>}
        </div>
    )
}
