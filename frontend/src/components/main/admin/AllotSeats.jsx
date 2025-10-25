import { Button, styled } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useAlert } from "../../../AlertContext";
import {closestCorners, DndContext, DragOverlay, useDraggable} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {motion} from "framer-motion";

let batchTable = [];
let backupSeats = new Map();

export default function AllotSeats() {
    const collegeData = useSelector(state => state.college);
    const [college, setCollege] = useState(null);
    const examRequest = useLocation().state.examReq;
    const headers = useSelector(state => state.headers);
    const [noOfBatch, setNoOfBatch] = useState(1);
    const [noOfStudentCategories, setNoOfStudentCategories] = useState(0);
    const navigate = useNavigate();
    const {showAlert} = useAlert();
    const [stdCategory, setStdCategory] = useState([]);
    const [savingAllotment, setSavingAllotment] = useState(false);
    const [isAllotmentSaved, setIsAllotmentSaved] = useState(false);
    const [seatDragActiveId, setSeatDragActiveId] = useState(null);
    const [openContextMenu, setOpenContextMenu] = useState({id: '', open: false})
    const [selected, setSelected] = useState(new Map());

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

                    return {...classRoom, edit: false, isSelected: isClassRoomAllotted, isFinalized: isFinalized, seats: seats}
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

        

        if(noOfBatch < 2) {
            batches.push(Array.from({length: batches[batches.length - 1].length}, (_) => {return {usn: 0}}));
        }
        
        let batchLengths = batches.map((batch) => batch.length);
        let maxBatchSize = Math.max(...batchLengths);

        batchTable = [];

        for(let j = 0; j < maxBatchSize; j++) {
            let newRow = [];
            for(let i = 0; i < batches.length; i++) {
                newRow.push(batches[i][j] || {usn: 0});
            }
            batchTable.push(newRow);
        }
    }

    const allotSeat = () => {
        if(examRequest?.eligibleStudents?.length === 0) {
            showAlert("No Eligible Students Added!", "info");
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
                                    if((noOfBatch > 1 && btc >= noOfBatch) || (noOfBatch < 2 && btc >= 2)) {
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

    const handleBranchDragEnd = event => {
        const {active, over} = event;

        if(active.id === over.id) return;

        let activeIdx = stdCategory.findIndex(obj => obj._id === active.id);
        let overIdx = stdCategory.findIndex(obj => obj._id === over.id);

        let updatedStdCategory = stdCategory;
        let temp = updatedStdCategory[activeIdx];
        updatedStdCategory[activeIdx] = updatedStdCategory[overIdx];
        updatedStdCategory[overIdx] = temp;
        
        setStdCategory([...updatedStdCategory]);   
    }

    const handleSeatDragStart = (event) => {
        setSeatDragActiveId(event.active.id);
    }
    
    const handleSeatDragEnd = (event) => {
        const {active, over} = event;
        
        if(!over || active.id === over.id) {
            setSeatDragActiveId(null);
            return;
        }

        if(selected.size === 0){
            let [aBIdx, aFIdx, aCRIdx, aSRIdx, aSCIdx] = active.id.split('-');
            let [oBIdx, oFIdx, oCRIdx, oSRIdx, oSCIdx] = over.id.split('-');

            let updatedCollege = college;

            if(!updatedCollege.buildings[aBIdx].floors[aFIdx].classRooms[aCRIdx].edit || !updatedCollege.buildings[oBIdx].floors[oFIdx].classRooms[oCRIdx].edit) {
                return;
            }

            let temp = updatedCollege.buildings[aBIdx].floors[aFIdx].classRooms[aCRIdx].seats[aSRIdx][aSCIdx];
            updatedCollege.buildings[aBIdx].floors[aFIdx].classRooms[aCRIdx].seats[aSRIdx][aSCIdx] = updatedCollege.buildings[oBIdx].floors[oFIdx].classRooms[oCRIdx].seats[oSRIdx][oSCIdx];
            updatedCollege.buildings[oBIdx].floors[oFIdx].classRooms[oCRIdx].seats[oSRIdx][oSCIdx] = temp;

            setCollege({...updatedCollege});
            setSeatDragActiveId(null);

        } else {
            let [oBIdx, oFIdx, oCRIdx, oSRIdx, oSCIdx] = over.id.split('-').map(val => parseInt(val));
            let newCollege = college;
            let classRoom = newCollege.buildings[oBIdx].floors[oFIdx].classRooms[oCRIdx];
            let rowLength = classRoom.rows;
            let columnLength = classRoom.columns;
             
            let seats = classRoom.seats;
            let newSelected = new Map(selected);
            for(let key of selected.keys()) {
                
                if(oSRIdx >= rowLength) {
                    oSRIdx = 0;
                    oSCIdx += 1;

                    if(oSCIdx >= columnLength) {
                        break;
                    }
                }

                const [pBIdx, pFIdx, pCRIdx, pSRIdx, pSCIdx] = key.split('-');
                if(seats[oSRIdx][oSCIdx].usn == 0) {
                    seats[oSRIdx][oSCIdx] = selected.get(key);
                    newCollege.buildings[pBIdx].floors[pFIdx].classRooms[pCRIdx].seats[pSRIdx][pSCIdx] = {usn: 0}
                    newSelected.delete(key);
                    
                    let newKey = `${oBIdx}-${oFIdx}-${oCRIdx}-${oSRIdx}-${oSCIdx}`;
                    newSelected.set(newKey, seats[oSRIdx][oSCIdx]);

                    oSRIdx++;
                }
            }

            setCollege({...newCollege});
            setSelected(newSelected);
        }
    }

    const handleContextMenu = (id, open) => {
        setOpenContextMenu({id: id, open: open});
    }

    const handleUsnChange = (e, bIdx, fIdx, cRIdx, sRIdx, sCIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].seats[sRIdx][sCIdx].usn = e.target.value;

        setCollege({...updatedCollege});
    }

    const handleClassRoomEdit = (bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].edit = !updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].edit;
        backupSeats.set(`${bIdx}-${fIdx}-${cRIdx}`, [...updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].seats.map((row) => row.map((seat) => {return {...seat}}))]);
        setCollege({...updatedCollege});
        setSelected(new Map());
    }

    const handleBack = (bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].edit = false;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx].seats = backupSeats.get(`${bIdx}-${fIdx}-${cRIdx}`);
        backupSeats.delete(`${bIdx}-${fIdx}-${cRIdx}`);
        setCollege({...updatedCollege});
        setSelected(new Map());
    }

    const getSeat = (id) => {
        const [bIdx, fIdx, cRIdx, sRIdx, sCIdx] = id.split('-');
        return college.buildings[bIdx].floors[fIdx].classRooms[cRIdx].seats[sRIdx][sCIdx];
    }

    const getClassRoom = (id) => {
        const [bIdx, fIdx, cRIdx, sRIdx, sCIdx] = id.split('-');
        return college.buildings[bIdx].floors[fIdx].classRooms[cRIdx];
    }

    const handleSelect = (e, id, seat) => {
        if(!getClassRoom(id).edit || (!e.ctrlKey && !e.metaKey)) {
            if(!selected.has(id)) {
                setSelected(new Map());
            }
            return;
        }
        
        let newSelect = new Map(selected);

        if(newSelect.has(id)) {
            newSelect.delete(id);
        } else {
            newSelect.set(id, seat);
        }
        
        setSelected(newSelect);
    }

    return (
        <div className="w-full flex flex-col items-center bg-gradient-to-br from-blue-100 text-gray-800">
            {college? 
                <div className="w-full p-5">
                    <h1 className="font-semibold text-xl text-center text-gray-500">Select available classes in college</h1>
                    <div className="mt-5 p-4 rounded-2xl border border-gray-300 bg-white">
                        <h1 className="p-2 text-center text-gray-600">Buildings</h1>
                        {college.buildings.map((building, bIdx) => 
                            <div key={bIdx} className="mt-5">
                                <button
                                    className={`px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white ${building.isSelected && 'bg-black text-white rounded-b-none'}`}
                                    onClick={(e) => handleBuildingSelection(e, bIdx)}
                                    >{building.name}
                                </button>
                                
                                {building.isSelected && 
                                    <div className="p-2 rounded-b-2xl bg-gray-100">    
                                        <h1 className="p-2 text-center text-gray-600">Floors</h1>
                                        {building.floors.map((floor, fIdx) => 
                                            <motion.div 
                                                initial={{ opacity: 0}}
                                                animate={{ opacity: 1}}
                                                transition={{ duration: 0.6, ease: "easeOut" }} 
                                                key={fIdx} 
                                                className="mt-2">

                                                <button 
                                                    className={`px-3 py-1 text-sm text-black rounded-xl text-nowrap shadow transition-all border border-gray-600 hover:bg-black hover:text-white ${floor.isSelected && 'bg-black text-white rounded-b-none'}`}
                                                    onClick={(e) => handleFloorSelection(e, bIdx, fIdx)}
                                                    >{floor.name}</button>

                                                {floor.isSelected &&
                                                    < motion.div
                                                        initial={{ opacity: 0}}
                                                        animate={{ opacity: 1}}
                                                        transition={{ duration: 0.6, ease: "easeOut" }} 
                                                        className='w-full mb-5 p-5 grid grid-cols-4 gap-5 place-items-center rounded-b-2xl overflow-auto bg-gray-300'>
                                                        {floor.classRooms.map((classRoom, cRIdx) => 
                                                            <div key={cRIdx}>
                                                                <label htmlFor={`${bIdx}${fIdx}${cRIdx}`} className="px-3 py-2 flex items-center">
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
                                                    </motion.div>   
                                                }
                                            </motion.div>
                                        )}
                                    </div>    
                                }                                    
                            </div>
                        )}                            
                    </div>

                    <div className="my-5 p-5 flex flex-col gap-2 overflow-auto border border-gray-300 rounded-2xl bg-white">
                    
                        {stdCategory && 
                        <div className="max-w-100 flex flex-col p-3 gap-5 bg-gray-100 rounded-2xl">
                            <DndContext onDragEnd={handleBranchDragEnd} collisionDetection={closestCorners}>
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
                                <h1>Number of branches in each Class:</h1>
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
                        <div className="flex flex-col">
                            <DndContext onDragStart={handleSeatDragStart} onDragEnd={handleSeatDragEnd}>
                                {college.buildings.map((building, bIdx) => 
                                    (building.isSelected ? 
                                        building.floors.map((floor, fIdx) => 
                                            (floor.isSelected ?
                                                floor.classRooms.map((classRoom, cRIdx) => 
                                                    (classRoom.isSelected ? 
                                                        (<div key={`${bIdx}${fIdx}${cRIdx}`} 
                                                            className="mb-6 p-5 border border-gray-300 bg-white rounded-2xl flex flex-col gap-3"
                                                            onClick={() => setSelected(new Map())}>
                                                            <div className="p-2 flex flex-wrap justify-between items-center  border-b border-gray-300 text-gray-800">
                                                                
                                                                <div className="flex gap-3 items-center">
                                                                    <div className="">ClassRoom: {classRoom.name}</div>
                                                                    {!classRoom.edit && <button
                                                                        onClick={() => handleClassRoomEdit(bIdx, fIdx, cRIdx)}
                                                                        className="px-3 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white outline-0 rounded-2xl text-sm transition-colors">
                                                                        Edit
                                                                    </button>}
                                                                    {classRoom.edit && <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleClassRoomEdit(bIdx, fIdx, cRIdx)}
                                                                            className="px-3 py-2 border border-green-600 text-green-600 hover:bg-green-600 hover:text-white outline-0 rounded-2xl text-sm transition-colors">
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleBack(bIdx, fIdx, cRIdx)}
                                                                            className="px-3 py-2 border border-gray-600 hover:bg-black hover:text-white text-black outline-0 rounded-2xl text-sm transition-colors">
                                                                            Back
                                                                        </button>
                                                                    </div>}
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
                                                                className="grid gap-2 overflow-auto"
                                                                style={{gridTemplateRows: `repeat(${classRoom.rows}, 1fr)`, gridTemplateColumns: `repeat(${classRoom.columns}, 1fr)`}}>
                                                                {classRoom.seats.map( (row, sRIdx) => row.map((obj, sCIdx) =>{
                                                                    let id = `${bIdx}-${fIdx}-${cRIdx}-${sRIdx}-${sCIdx}`;
                                                                    return(
                                                                        <div 
                                                                            key={id} 
                                                                            className="border-2"
                                                                            onPointerDown={(e) => handleSelect(e, id, obj)}
                                                                            style={{borderColor: selected.has(id) ? 'blue' : 'transparent'}}>

                                                                            {openContextMenu.id === id && openContextMenu.open && <ContextMenu handleContextMenu={handleContextMenu}/>}
                                                                            <Seat 
                                                                                key={id} 
                                                                                id={id}
                                                                                seat={obj} 
                                                                                disabled={!classRoom.edit}
                                                                                handleUsnChange={handleUsnChange}
                                                                                />
                                                                        </div>
                                                                    )
                                                                }))}
                                                            </div>   
                                                        </div>) : null
                                                    )   
                                                ) : null
                                            )
                                        ) : null
                                    )
                                )}
                                {seatDragActiveId && getClassRoom(seatDragActiveId).edit && <DragOverlay>
                                    {selected.size == 0 ? <div className="px-2 py-3 text-sm rounded-lg bg-gray-100 text-gray-500 cursor-grab shadow-2xl shadow-black">
                                        {getSeat(seatDragActiveId).usn}
                                    </div> : 
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.1, ease: "easeOut", delay: 0.2 }}
                                        className="px-2 border border-gray-300 bg-white shadow-2xl shadow-blacke overflow-hidden rounded-lg"> 
                                        {Array.from(selected.entries()).map(([key, seat]) => 
                                            <div key={key} className="my-2 px-2 py-3 text-sm rounded-lg bg-gray-100 text-gray-500 cursor-grab ">
                                                {seat.usn}
                                            </div>
                                        )}
                                    </motion.div>}
                                </DragOverlay>}
                            </DndContext>
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
            className="p-2 bg-white cursor-pointer rounded-xl shadow border border-gray-300"
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

function Seat({id, seat, disabled, handleUsnChange}) {
    const {attributes, listeners, setNodeRef, transform,  transition, isDragging} = useSortable({id});
    const style = {transform: CSS.Transform.toString(transform), transition: "transform 0s"};

    return (
        <div
        ref={setNodeRef} 
        {...attributes} 
        {...listeners} 
        style={style} 
        className="min-w-25 px-2 py-3 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer">
            <input
                readOnly={disabled || seat.usn == 0}
                className="outline-gray-400 outline-0"
                onContextMenu={(e) => e.preventDefault()}
                value={seat?.usn}
                style={{opacity: !disabled ? (isDragging ? 0 : 1) : 1}}
                onChange={(e) => {let [bIdx, fIdx, cRIdx, sRIdx, sCIdx] = id.split('-'); handleUsnChange(e, bIdx, fIdx, cRIdx, sRIdx, sCIdx);}}
            />            
        </div>
    );
}

function ContextMenu({handleContextMenu}) {
    return(
        <div className="min-w-40 py-4 absolute bottom-10 bg-white rounded-2xl flex flex-col border border-gray-200 shadow-xl z-2">
            <button className="w-full p-2 hover:bg-gray-200" onClick={() => handleContextMenu('', false)}>
                Cancel
            </button>
        </div>
    );
}