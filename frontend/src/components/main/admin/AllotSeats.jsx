import { Button, styled } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAlert } from "../../../AlertContext";
import {closestCorners, DndContext} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

let batchTable = [];

export default function AllotSeats() {
    const collegeData = useSelector(state => state.college);
    const [college, setCollege] = useState(null);
    const examRequest = useLocation().state.examReq;
    const headers = useSelector(state => state.headers);
    const [noOfBatch, setNoOfBatch] = useState(2);
    const [noOfStudentCategories, setNoOfStudentCategories] = useState(0);
    const navigate = useNavigate();
    const {showAlert} = useAlert();
    const [stdCategory, setStdCategory] = useState([]);
    const [savingAllotment, setSavingAllotment] = useState(false);
    const [isAllotmentSaved, setIsAllotmentSaved] = useState(false);

    const getCollege = async () => {
        let currentCollege = {...collegeData};

        // For faster lookup i am using Set()
        const buildingIds = new Set(examRequest.allotment.map(allotted => allotted.building._id));
        const floorIds = new Set(examRequest.allotment.map(allotted => allotted.floor._id));
        const classRoomIds = new Set(examRequest.allotment.map(allotted => allotted.classRoom._id));

        currentCollege.buildings = currentCollege.buildings.map(building => {
            return {...building, isSelected: buildingIds.has(building._id), floors: building.floors.map(floor => {
                return {...floor, isSelected: floorIds.has(floor._id), classRooms: floor.classRooms.map(classRoom => {   
                    let isClassRoomAllotted= classRoomIds.has(classRoom._id);
                    let seats = null;
                    let isFinalized = false;

                    if(isClassRoomAllotted) {
                        for(let allotted of examRequest.allotment) {
                            if(allotted.classRoom._id === classRoom._id) {
                                seats = allotted.classRoom.seats;
                                isFinalized = allotted.classRoom.isFinalized;
                                break;
                            }
                        }
                    }

                    if(!seats) {
                        seats = Array.from({length: classRoom.rows}, () => Array(classRoom.columns).fill(0))
                    }

                    return {...classRoom, isSelected: isClassRoomAllotted, isFinalized: isFinalized, seats: seats}
                })}
            })}
        });
        setCollege(currentCollege);
    }

    useEffect(() => {
        if(!collegeData?._id) {
            return navigate('/');
        }
        
        if(examRequest?._id) {
            getCollege();
            setStdCategory(examRequest.eligibleStudents.map((elStd) => {return {...elStd}}));
            setNoOfStudentCategories(examRequest.eligibleStudents.length);
        }
    }, []);

    const handleBuildingSelection = (e, bIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].isSelected = !updatedCollege.buildings[bIdx].isSelected;

        if(!updatedCollege.buildings[bIdx].isSelected) {
            updatedCollege.buildings[bIdx].floors = updatedCollege.buildings[bIdx].floors.map(floor => 
                        {return {...floor, isSelected: false, classRooms: floor.classRooms.map(classRoom => 
                            {return {...classRoom, isSelected: false}})}})
        }
        setCollege({...updatedCollege});
        setIsAllotmentSaved(false);
    }

    const handleFloorSelection = (e, bIdx, fIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].isSelected = !updatedCollege.buildings[bIdx].floors[fIdx].isSelected;

        if(!updatedCollege.buildings[bIdx].floors[fIdx].isSelected) {
            updatedCollege.buildings[bIdx].floors[fIdx].classRooms = updatedCollege.buildings[bIdx].floors[fIdx].classRooms.map(classRoom =>  
                {return {...classRoom, isSelected: false}})

        }
        setCollege({...updatedCollege});
        setIsAllotmentSaved(false);

    }

    const handleClassRoomSelection = (e, bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].isSelected = e.target.checked;
        setCollege({...updatedCollege});
        setIsAllotmentSaved(false);
    }

    const finalizeClass = (e, bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].isFinalized = e.target.checked;
        setCollege({...updatedCollege});
        setIsAllotmentSaved(false);
    }

    const createBatch = () => {
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
                updatedBatch = [...updatedBatch, ...stdCat.students.map(std => {return {branch: stdCat.branch, semester: stdCat.semester, subject: stdCat.subject, usn: std}})];
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
        if(examRequest?.eligibleStudents?.length === 0) {
            alert("No Eligible Students Added!");
            return;
        }

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
                                        seats[i][j] = (btr[btc] < batchTable.length && batchTable[btr[btc]][btc]) ? batchTable[btr[btc]++][btc] : {usn: 0};
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
        setIsAllotmentSaved(false);
        showAlert("Seats allotted successfully!", "success");
    }

    const saveAllotment = async () => {
        let allotment = [];
        setSavingAllotment(true);
        for(let building of college.buildings) {
            if(building.isSelected) {
                for(let floor of building.floors) {
                    if(floor.isSelected) {
                        for(let classRoom of floor.classRooms) {
                            if(classRoom.isSelected) {
                                allotment.push({building: {_id: building._id, name: building.name}, floor: {_id: floor._id, name: floor.name}, classRoom: classRoom});
                            }
                        }                        
                    }
                }                
            }
        }

        try {
            let response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/exam/allotment`, {examId: examRequest._id, allotment}, {headers});

            if(response.status == 200) {
                setSavingAllotment(false);
                setIsAllotmentSaved(true);
                showAlert("Seats allocation saved Successfully!", "success");
            }
            
        } catch(err) {
            console.log(err);
            showAlert("Something went wrong!", "error");
        }
    }

    const handleDragEnd = event => {
        const {active, over} = event

        if(active.id === over.id) return;

        let activeIdx = stdCategory.findIndex(obj => obj._id === active.id);
        let overIdx = stdCategory.findIndex(obj => obj._id === over.id);

        let updatedStdCategory = stdCategory;
        let temp = updatedStdCategory[activeIdx];
        updatedStdCategory[activeIdx] = updatedStdCategory[overIdx];
        updatedStdCategory[overIdx] = temp;
        
        setStdCategory([...updatedStdCategory]);
        
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
                                                                        checked={classRoom.isSelected || false}
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
                    
                        {stdCategory && 
                        <div className="max-w-100 flex flex-col p-3 gap-5 bg-gray-200 rounded-2xl">
                            <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                                <div className="flex flex-col gap-2">
                                    <h1>Branch Priority</h1>
                                    <SortableContext items={stdCategory.map(item => item._id)} strategy={verticalListSortingStrategy}>
                                        {stdCategory.map((stdCat, idx) => 
                                            <StudentCategory key={stdCat._id} id={stdCat._id} idx={idx} category={stdCat}/>
                                        )}                                           
                                    </SortableContext>
                                </div>
                            </DndContext>

                            <div className="w-fulls flex flex-col">
                                <h1>Number of branches for each Class:</h1>
                                <div className="flex items-center">
                                    <button 
                                        className="h-8 w-8 bg-gray-300 text-black rounded-full flex items-center justify-center cursor-pointer"
                                        onClick={() => setNoOfBatch(n => n - 1 >= 1 ? n - 1 : 1)}
                                    ><RemoveIcon sx={{fontSize: "1rem"}}/></button>

                                    <h1 className="mx-2 px-4 py-2 text-lg ">{noOfBatch}</h1>

                                    <button 
                                        className="h-8 w-8 bg-gray-300 text-black rounded-full flex items-center justify-center cursor-pointer"
                                        onClick={() => setNoOfBatch(n => n + 1 <= noOfStudentCategories ? n + 1 : noOfStudentCategories)}
                                    ><AddIcon sx={{fontSize: "1rem"}}/></button> 
                                </div>
                            </div>
                        </div>}

                        <div className="flex gap-2">
                            <Button
                                variant='outlined' 
                                color="dark" 
                                onClick={allotSeat}
                                sx={{
                                    padding: "0.2rem 0.5rem",
                                    textTransform: "capitalize",
                                    borderRadius: "0.8rem",
                                    color: "black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "none",
                                    ":hover": {backgroundColor: "black", color: "white"}
                                }}
                                >Allot Seats</Button>
                            <Button 
                                disabled={isAllotmentSaved} 
                                loading={savingAllotment}
                                variant='outlined' 
                                color="dark" 
                                onClick={saveAllotment}
                                sx={{
                                    padding: "0.2rem 0.5rem",
                                    textTransform: "capitalize",
                                    borderRadius: "0.8rem",
                                    color: "black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "none",
                                    ":hover": {backgroundColor: "#16A34A", color: "white"}
                                }}
                                >Save Allotment</Button>  
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
                                                        <div className="flex flex-wrap justify-between items-center">
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

                                                            <label htmlFor={`${bIdx}${fIdx}${cRIdx}f`} className="flex items-center gap-2">
                                                                Finalize
                                                                <input  
                                                                    id={`${bIdx}${fIdx}${cRIdx}f`}
                                                                    type="checkbox"
                                                                    className="ml-2 size-5 accent-green-600"
                                                                    checked={classRoom.isFinalized}
                                                                    onChange={(e) => finalizeClass(e, bIdx, fIdx, cRIdx)}
                                                                />                                                                
                                                            </label>
                                                        </div>
                                                        <div 
                                                            className={`w-full mt-3 grid row-auto gap-2 place-items-center overflow-auto`}
                                                            style={{gridTemplateColumns: `repeat(${classRoom.columns}, auto)`}}>
                                                            {classRoom.seats.map( row => row.map((obj, idx) => <div key={idx} className="w-full p-5 bg-neutral-200">{obj.usn == 0 ? '-' : obj.usn}</div>))}
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

function StudentCategory({id, idx, category}) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});
    const style = {transition, transform: CSS.Transform.toString(transform)}

    return (
        <div 
            ref={setNodeRef} 
            {...attributes} 
            {...listeners} 
            className="p-2 bg-white cursor-pointer rounded-xl"
            style={style}
            >   
            <h1 className="flex gap-4">
                <span>{idx + 1}</span>
                <span><span className="text-gray-600">Branch: </span>{category.branch} </span>
                <span><span className="text-gray-600">Semester: </span>{category.semester}</span>
            </h1>
        </div>
    )

}