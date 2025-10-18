import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { setCollege } from '../../../features/seatingSlice';
import {Button} from "@mui/material";
import axios from 'axios';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAlert } from "../../../AlertContext";

export default function CollegeData() {
    const collegeData = useSelector(state => state.college);
    const user = useSelector(state => state.user);
    const [collegeDataCopy, setCollegeDataCopy] = useState({});
    const [currRefresh, setCurrRefresh] = useState(false);
    const dispatch = useDispatch();
    const {showAlert} = useAlert();

    const getCollege = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${user.college}`);
            if(response.status === 200) {
                dispatch(setCollege(response.data.college));
            }
        } catch(err) {
            console.log(err);
            showAlert("Got error from the server while getting the college data", "error");
        }
    }

    useEffect(() => {

        if(!collegeData?._id) {
            return;
        }
        let tempCollegeData = JSON.parse(JSON.stringify(collegeData));
        
        for(let building of tempCollegeData.buildings) {
            building.edit = false;
        }

        setCollegeDataCopy({...tempCollegeData});
    }, [collegeData, currRefresh]);

    const editBuilding = (bIdx) => {
        let updatedCollege = collegeDataCopy;
        updatedCollege.buildings[bIdx].edit = !updatedCollege.buildings[bIdx].edit;

        setCollegeDataCopy({...updatedCollege});
    }

    const handleBuildingChange = (e, bIdx) => {
        let updatedCollege = collegeDataCopy;
        updatedCollege.buildings[bIdx][e.target.name] = e.target.value;

        setCollegeDataCopy({...updatedCollege});
    }

    const handleFloorChange = (e, bIdx, fIdx) => {
        let updatedCollege = collegeDataCopy;
        updatedCollege.buildings[bIdx].floors[fIdx][e.target.name] = e.target.value;

        setCollegeDataCopy({...updatedCollege});
    }

    const handleClassChange = (e, bIdx, fIdx, cRIdx) => {
        let updatedCollege = collegeDataCopy;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx][e.target.name] = e.target.value;

        setCollegeDataCopy({...updatedCollege});
    }

    const addNewFloor = (bIdx) => {
        let updatedCollege = collegeDataCopy;

        if(updatedCollege.buildings[bIdx].floors[updatedCollege.buildings[bIdx].floors.length - 1].name != '') {
            updatedCollege.buildings[bIdx].floors.push({name: '', classRooms: [{name: '', rows: '', columns: ''}]});
        }

        setCollegeDataCopy({...updatedCollege});
    }

    const addNewClassRoom = (bIdx, fIdx) => {
        let updatedCollege = collegeDataCopy;

        if(updatedCollege.buildings[bIdx].floors[fIdx].classRooms.length === 0 || updatedCollege.buildings[bIdx].floors[fIdx].classRooms[updatedCollege.buildings[bIdx].floors[fIdx].classRooms.length - 1].name != '') {
            updatedCollege.buildings[bIdx].floors[fIdx].classRooms.push({name: '', rows: '', columns: ''});
        }

        setCollegeDataCopy({...updatedCollege});
    }

    const deleteClass = (bIdx, fIdx, cRIdx) => {
        let updatedCollege = collegeDataCopy;

        updatedCollege.buildings[bIdx].floors[fIdx].classRooms.splice(cRIdx, 1);
        setCollegeDataCopy({...updatedCollege});
    }

    const deleteFloor = (bIdx, fIdx) => {
        let updatedCollege = collegeDataCopy;

        delete updatedCollege.buildings[bIdx].floors[fIdx];

        setCollegeDataCopy({...updatedCollege});   
    }

    const deleteBuilding = async (bIdx) => {
        let name = prompt(`Enter Building Name to Delete: '${collegeDataCopy.buildings[bIdx].name}'`);

        if(name != collegeDataCopy.buildings[bIdx].name) {
            showAlert("Wrong Building Name!", "warning");
            return;
        }

        try {
            let response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/college/building`, 
                {data: {collegeId: collegeDataCopy._id, buildingId: collegeDataCopy.buildings[bIdx]._id}});
            if(response.status == 200) {
                showAlert("Building Removed Successfully!", "success");
                getCollege();
            }
        } catch(err) {
            console.log(err);
            showAlert("Something went wrong!", "error");
        }
    }

    const saveUpdates = async (bIdx) => {
        try {
            let response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/college/building`, 
                {collegeId: collegeDataCopy._id, building: collegeDataCopy.buildings[bIdx]});
            if(response.status == 200) {
                showAlert("Data Updated Successfully", "success");
                getCollege();
            }
        } catch(err) {
            console.log(err);
            showAlert("Something went wrong!", "error");
        }
    }

    return (
        <div className='w-full p-5'>
            {collegeDataCopy?._id ?
                <div className='w-full'>
                    <h1 className='text-center font-bold text-2xl text-gray-700'>{collegeDataCopy.name}</h1>
                    <div className='w-full p-2 mt-5'>
                        <AddNewBuilding getCollege={getCollege}/>
                        <div className='w-full mt-5'>
                            {collegeDataCopy.buildings.length != 0 ? collegeDataCopy.buildings.map((building, bIdx) => 
                                <div key={bIdx} className='w-full mb-3 p-3 border rounded-2xl flex flex-col items-start'>
                                    <div className='w-full p-2 flex gap-2 my-2 bg-gray-200 rounded-2xl'>
                                        {!building.edit &&
                                            
                                            <button
                                                className='px-3 py-2 text-sm cursor-pointer rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all'
                                                onClick={() => editBuilding(bIdx)}>Edit</button>
                                            
                                        }
                                        {building.edit && 
                                            <button
                                                className='px-3 py-2 text-sm cursor-pointer rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all'
                                                onClick={() => deleteBuilding(bIdx)}>Delete</button>
                                        }
                                        {building.edit && 
                                            <>
                                                <button
                                                    className='px-3 py-2 text-sm cursor-pointer border-black rounded-2xl bg-green-600 hover:bg-green-700 text-white transition-all'
                                                    onClick={() => saveUpdates(bIdx)}>Save</button>

                                                <button
                                                    className='px-3 py-2 text-sm cursor-pointer bg-gray-600 rounded-2xl text-white'
                                                    onClick={() => setCurrRefresh(r => !r)}>Back</button>                                            
                                            </>
                                        }                                       
                                    </div>

                                    <label htmlFor="" className='mb-2 flex flex-col'>
                                        Building Name:
                                        <input type='text' name='name' placeholder='ex: main block' onChange={(e) => handleBuildingChange(e, bIdx)} value={building.name} className='px-4 py-2 text-sm bg-gray-200 rounded-2xl' readOnly={!building.edit}/>
                                    </label>
                                    <label htmlFor="" className='flex flex-col'>
                                        Number of Floors:
                                        <input type='text' value={building.noOfFloors} className='px-4 py-2 text-sm bg-gray-200 rounded-2xl' readOnly={true}/>
                                    </label>
                                    {
                                        building.floors.length > 0 ? building.floors.map((floor, fIdx) =>
                                            <div key={fIdx} className='w-full mt-3 p-3 rounded-2xl border'>
                                                <div className='w-full flex justify-end'>
                                                  {building.edit && <button
                                                        className='px-3 py-2 text-sm cursor-pointer rounded-2xl bg-red-600 hover:bg-red-700 text-white transition-all'
                                                        onClick={() => deleteFloor(bIdx, fIdx)}>Delete Floor</button>}  
                                                </div>
                                                
                                                <label htmlFor="" className='flex items-center gap-2 flex-wrap'>
                                                    Floor Name:
                                                    <input type='text' name='name' onChange={(e) => handleFloorChange(e, bIdx, fIdx)} value={floor.name} className='px-4 py-2 text-sm bg-gray-200 rounded-2xl' readOnly={!building.edit}/>
                                                </label>
                                                <div className='mt-5 w-full '>
                                                    <h1 className='mb-2 px-2'>ClassRooms:</h1>
                                                    {floor.classRooms.map((classRoom, cRIdx) => 
                                                        <div key={cRIdx} className='w-full mb-1 px-4 py-2 flex flex-wrap items-center gap-2 bg-gray-200 overflow-auto rounded-2xl'>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Class Name:
                                                                <input required type="text" name='name' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)}  placeholder='Class Name'  value={classRoom?.name} readOnly={!building.edit}/>
                                                            </label>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Rows:
                                                                <input required type="number" name='rows' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)} placeholder='Rows' value={classRoom?.rows} readOnly={!building.edit}/>
                                                            </label>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Columns:
                                                                <input required type="number" name='columns' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)}  placeholder='Columns' value={classRoom?.columns} readOnly={!building.edit}/>
                                                            </label>
                                                            {building.edit && <button
                                                                className='px-3 py-2 text-sm cursor-pointer rounded-2xl text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-all'
                                                                onClick={() => deleteClass(bIdx, fIdx, cRIdx)}>Delete</button>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex gap-3'>  
                                                    {building.edit && <button
                                                        className='px-2 py-1 rounded-2xl border border-black text-black hover:text-white hover:bg-black cursor-pointer flex gap-1 text-sm'
                                                        onClick={() => addNewClassRoom(bIdx, fIdx)}><AddCircleOutlineIcon/>Add Class</button>}

                                                </div>
                                                
                                            </div>
                                        ): <h1>No Floors Added!</h1>
                                    }
                                    {building.edit && 
                                        <button 
                                            type='button'
                                            className='mt-5 px-2 py-1 rounded-2xl border border-black text-black hover:text-white hover:bg-black cursor-pointer flex gap-1 text-sm'
                                            onClick={(e) => addNewFloor(bIdx)}
                                            ><AddCircleOutlineIcon/>Add Floor</button>}
                                </div>    
                            ): <p>No Buildings Added</p>}
                        </div>                        
                    </div>
                </div>
            : <h1>Loading..</h1>}
        </div>
    )
}


function AddNewBuilding({getCollege}) {
    const [building, setBuilding] = useState({name: "", noOfFloors: 0});
    const [floors, setFloors] = useState([]);
    const [classRooms, setClassRooms] = useState([]);
    const user = useSelector(state => state.user);
    const {showAlert} = useAlert();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let newBuilding = building;
        newBuilding.floors = floors;

        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/college/add-building`, {building: newBuilding, collegeId: user.college});
            if(response.status == 200) {
                showAlert("New building added Successfully!", "success");
                getCollege();
            }
        } catch(err) {
            console.log(err);
            showAlert("something went wrong", "error");
        }
    }

    useEffect(() => {
        if(building.noOfFloors >= 0) {
            let updatedFloors = floors;
            let updatedClassRooms = classRooms;
            updatedFloors = [];
            updatedClassRooms=[];
            for(let i = 0; i < building.noOfFloors; i++) {
                updatedFloors.push({name: '', classRooms: []});
                updatedClassRooms.push({name: '', rows: '', columns: ''});
            }
            
            setFloors([...updatedFloors]);
            setClassRooms([...updatedClassRooms]);
        }
    }, [building.noOfFloors]);

    const handleClassChange = (e, idx) => {
        let updatedClassRooms = classRooms;
        updatedClassRooms[idx][e.target.name] = e.target.value;
        setClassRooms([...updatedClassRooms]);
    }

    const addClassRoom = (idx) => {
        if(floors.length > idx) {
            let updatedFloors = floors;
            if(classRooms[idx].name && classRooms[idx].rows && classRooms[idx].columns) {
                updatedFloors[idx].classRooms.push({...classRooms[idx]});
                setFloors([...updatedFloors]);
            }
        }
    }

    return (
        <div className='p-4 w-full flex flex-col  border rounded-2xl'>
            <h1 className='text-center'>Add New Building</h1>
            <form onSubmit={handleFormSubmit} className='w-full p-1 flex flex-col items-start'>
                <label htmlFor="name" className='mb-2 flex flex-col'>
                    Building Name:
                    <input 
                        type="text" 
                        id='name' 
                        placeholder='ex: Main Block'
                        value={building.name} 
                        required
                        className='px-4 py-2 bg-gray-200 rounded-2xl text-sm'
                        onChange={(e) => setBuilding(b => {return {...b, name: e.target.value}})}/>  
                </label>
                
                <label htmlFor="noOfFloors" className='flex flex-col'>
                    Number of Floors:
                    <input 
                        type="number" 
                        placeholder='No.'
                        id='noOfFloors'
                        className='px-4 py-2 bg-gray-200 rounded-2xl text-sm'
                        min={0}
                        value={building.noOfFloors}
                        required
                        onChange={(e) => setBuilding(b => {return {...b, noOfFloors: e.target.value < 101 ? e.target.value : 100}})}/>  
                </label>
                {!building.noOfFloors && <h1 className='mt-4 text-gray-500'>No floors added...</h1>}
                {floors.length > 0 && floors.map((obj, idx) => 
                    <div key={idx} className='w-full mt-3 p-3 border rounded-2xl'>
                        <label htmlFor="floorName" className='flex flex-wrap gap-2'>
                            Floor Name:
                            <input 
                                type="text" 
                                className='px-4 py-2 bg-gray-200 rounded-2xl text-sm'
                                placeholder='Floor Name' 
                                value={obj.name}
                                required
                                id='floorName'
                                onChange={(e) => setFloors(f => {f[idx].name = e.target.value; return [...f]})}/>                            
                        </label>
                        
                        <div className='w-full mt-2 flex flex-wrap gap-2 items-center'>
                            <div className='w-full px-3 py-2 flex gap-2 flex-wrap items-center bg-gray-200 rounded-2xl'>
                                <label htmlFor="" className='flex gap-2 items-center text-nowrap overflow-auto'>
                                    Class Name:
                                    <input className='w-auto px-2 text-sm outline-none' required type="text" placeholder='Class Name' name='name' value={classRooms[idx].name} onChange={(e) => handleClassChange(e, idx)}/>
                                </label>
                                <label htmlFor="" className='flex gap-2 items-center text-nowrap overflow-auto'>
                                    Rows:
                                    <input className='px-2 text-sm outline-none' required type="number" placeholder='Rows' name='rows' value={classRooms[idx].rows} onChange={(e) => handleClassChange(e, idx)}/>
                                </label>
                                <label htmlFor="" className='flex gap-2 items-center text-nowrap overflow-auto'>
                                    Columns:
                                    <input className='px-2 text-sm outline-none' required type="number" placeholder='Columns' name='columns' value={classRooms[idx].columns} onChange={(e) => handleClassChange(e, idx)}/>    
                                </label>
                            </div>

                            <button
                                type='button'
                                className='px-2 py-1 rounded-2xl border border-black text-black hover:text-white hover:bg-black cursor-pointer flex gap-1 text-sm'
                                onClick={() => addClassRoom(idx)}
                                ><AddCircleOutlineIcon/>Add Class</button>
                        </div>
                        
                        <div className='w-full mt-2'>
                            {obj.classRooms && obj.classRooms.length > 0 ?
                                obj.classRooms.map((c, idx) => 
                                    <div key={idx} className='w-full mb-1 px-3 py-2 text-sm flex flex-wrap lg:flex-nowrap md:flex-nowrap gap-2 bg-gray-200 overflow-auto rounded-2xl'>
                                        <label htmlFor="" className='flex gap-2'>
                                            Name:
                                            <input type="text" name='name' value={c.name} readOnly={!building.edit}/>
                                        </label>
                                        <label htmlFor="" className='flex gap-2'>
                                            Rows:
                                            <input type="text" name='name' value={c.rows} readOnly={!building.edit}/>
                                        </label>
                                        <label htmlFor="" className='flex gap-2'>
                                            Columns:
                                            <input type="text" name='name' value={c.columns} readOnly={!building.edit}/>
                                        </label>
                                    </div>
                                )                                
                                : null}                            
                        </div>
                    </div>
                )}
                <button
                    className='mt-4 px-3 py-2 text-sm cursor-pointer rounded-2xl bg-green-600 hover:bg-green-700 text-white transition-all'
                    >Submit</button>
            </form>            
        </div>
    );
}