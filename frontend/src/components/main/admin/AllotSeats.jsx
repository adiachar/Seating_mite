import { Button } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

let batchTable = [[]];

export default function AllotSeats() {
    const [college, setCollege] = useState(null);
    const examRequest = useLocation().state.examReq;
    const [examReq, setExamReq] = useState(null);
    const user = useSelector(state => state.user);

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

    const handleBuildingSelection = (e, bIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].isSelected = !updatedCollege.buildings[bIdx].isSelected;

        if(!updatedCollege.buildings[bIdx].isSelected) {
            updatedCollege.buildings = updatedCollege.buildings.map(building => 
                    {return {...building, floors: building.floors.map(floor => 
                        {return {...floor, isSelected: false, classRooms: floor.classRooms.map(classRoom => 
                            {return {...classRoom, isSelected: false}})}})}});

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
        let batches = examReq.eligibleStudents.map((elStd) => {return {batch: `${elStd.branch}-${elStd.semester}`, students: elStd.students}});
        let batchSize = ( batches.length / 2 ) + ( batches.length % 2 );
        
        let batchAComplete = batches.slice(0, batchSize);
        let batchBComplete = batches.slice(batchSize, batches.length);

        let batchA = [];
        let batchB = [];
        
        for(let batch of batchAComplete) {
            batchA = [...batchA, ...batch.students];
        }

        for(let batch of batchBComplete) {
            batchB = [...batchB, ...batch.students];
        }

        let batchALength = batchA.length;
        let batchBLength = batchB.length;

        batchTable = Array.from({length: Math.max(batchALength, batchBLength)}, (_, idx) => {
            return [idx < batchALength ? batchA[idx] : 0, idx < batchBLength ? batchB[idx] : 0];
        });
    }

    const allotSeat = () => {
        createBatch();

        let updatedCollege = college;
        let btc0r = 0;
        let btc1r = 0;

        for(let building of updatedCollege.buildings) {
            if(building.isSelected) {
                for(let floor of building.floors) {
                    if(floor.isSelected) {
                        for(let room = 0; room < floor.classRooms.length; room++) {
                            if(floor.classRooms[room].isSelected) {
                                let seats = floor.classRooms[room].seats;
                                for(let j = 0; j < floor.classRooms[room].columns; j++) {
                                    let btc = j % 2;
                                    for(let i = 0; i < floor.classRooms[room].rows; i++) {
                                        seats[i][j] = (btc == 0 && btc0r > batchTable.length - 1) || (btc == 1 && btc1r > batchTable.length - 1) ? 0 : batchTable[btc == 0 ? btc0r++ : btc1r++][btc];
                                    }
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
    
    return (
        <div className="w-full flex flex-col items-center">
            {college? 
                <div className="w-full p-5">
                    <h1 className="font-semibold text-lg text-center text-neutral-700">Available Classes in college:</h1>
                    
                    <div>
                        <h1 className="">Buildings:</h1>
                        {college.buildings.map((building, bIdx) => 
                            <div key={bIdx} className="mt-2">
                                <Button
                                    size="small"
                                    color="success"
                                    sx={{boxShadow: "none"}}
                                    variant={building.isSelected ? 'contained' : 'outlined'}
                                    onClick={(e) => handleBuildingSelection(e, bIdx)}
                                    >{building.name}
                                </Button>
                                
                                {building.isSelected && 
                                    <div className="p-2 border rounded-r">    
                                        {building.floors.map((floor, fIdx) => 
                                            <div key={fIdx} className="">
                                                <Button 
                                                    size="small"
                                                    color="success"
                                                    sx={{marginBottom: "0.5rem"}}
                                                    variant={floor.isSelected ? 'contained' : 'outlined'}
                                                    onClick={(e) => handleFloorSelection(e, bIdx, fIdx)}
                                                    >{floor.name}</Button>

                                                {floor.isSelected &&
                                                    <div className='w-full mb-5 p-5 grid grid-cols-4 gap-5 place-items-center border border-neutral-500 rounded'>
                                                        {floor.classRooms.map((classRoom, cRIdx) => 
                                                            <div key={cRIdx}>
                                                                <label htmlFor={cRIdx} className="px-3 py-2 bg-neutral-300 rounded flex items-center">
                                                                    {classRoom.name} 
                                                                    <input 
                                                                        className="ml-2 size-5"
                                                                        id={cRIdx}
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
                    
                    <div>
                        <h1 className="font-semibold text-lg text-center text-neutral-700">Selected Classes for Allotment:</h1>
                        <div>
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
                                                            className={`w-full mt-3 grid row-auto gap-2 place-items-center`}
                                                            style={{gridTemplateColumns: `repeat(${classRoom.columns}, auto)`}}>
                                                            {classRoom.seats.map( row => row.map((col, idx) => <div key={idx} className="w-full p-5 bg-neutral-200">{col != 0 ? col : "-"}</div>))}
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
        <button onClick={allotSeat} className="px-3 py-2 rounded text-white bg-green-500">Allot Seats</button>
        </div>
    )
}
