import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import {Button} from "@mui/material";
import axios from 'axios';

export default function CollegeData() {
    const [college, setCollege] = useState(null);
    const user = useSelector(state => state.user);
    const [refresh, setRefresh] = useState(false);

    const getCollegeData = async () => {
        if(!user) {
            return;
        }

        try {
            const collegeId = user.college;
            const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${collegeId}`);

            if(response.status === 200) {
                let collegeData = response.data.college;
                collegeData.buildings = collegeData.buildings.map((building) => {return {...building, edit: false}});
                setCollege(collegeData);
            }
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getCollegeData();
    }, [refresh]);

    const editBuilding = (bIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].edit = !updatedCollege.buildings[bIdx].edit;

        setCollege({...updatedCollege});
    }

    const handleBuildingChange = (e, bIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx][e.target.name] = e.target.value;

        setCollege({...updatedCollege});
    }

    const handleFloorChange = (e, bIdx, fIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx][e.target.name] = e.target.value;

        setCollege({...updatedCollege});
    }

    const handleClassChange = (e, bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;
        updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx][e.target.name] = e.target.value;

        setCollege({...updatedCollege});
    }

    const addNewFloor = (bIdx) => {
        let updatedCollege = college;

        if(updatedCollege.buildings[bIdx].floors[updatedCollege.buildings[bIdx].floors.length - 1].name != '') {
            updatedCollege.buildings[bIdx].floors.push({name: '', classRooms: [{name: '', rows: '', columns: ''}]});
        }

        setCollege({...updatedCollege});
    }

    const addNewClassRoom = (bIdx, fIdx) => {
        let updatedCollege = college;

        if(updatedCollege.buildings[bIdx].floors[fIdx].classRooms[updatedCollege.buildings[bIdx].floors[fIdx].classRooms.length - 1].name != '') {
            updatedCollege.buildings[bIdx].floors[fIdx].classRooms.push({name: '', rows: '', columns: ''});
        }

        setCollege({...updatedCollege});
    }

    const deleteClass = (bIdx, fIdx, cRIdx) => {
        let updatedCollege = college;

        delete updatedCollege.buildings[bIdx].floors[fIdx].classRooms[cRIdx];

        setCollege({...updatedCollege});
    }

    const deleteFloor = (bIdx, fIdx) => {
        let updatedCollege = college;

        delete updatedCollege.buildings[bIdx].floors[fIdx];

        setCollege({...updatedCollege});   
    }

    const saveUpdates = async (bIdx) => {
        try {
            let response = await axios.patch(`${import.meta.env.VITE_SERVER_URL}/college/update-building-data`, 
                {collegeId: college._id, building: college.buildings[bIdx]});
            if(response.status == 200) {
                alert("Data Saved Successfully");
                setRefresh(r => !r);
            }
        } catch(err) {
            console.log(err);
            alert("Something went wrong!");
        }
    }

    return (
        <div className='w-full p-5'>
            {college ?
                <div className='w-full'>
                    <h1>{college.name}</h1>

                    <div className='w-full p-2 border'>
                        <AddNewBuilding setRefresh={setRefresh}/>
                        <div className='w-full mt-5'>
                            {college.buildings.length != 0 ? college.buildings.map((building, bIdx) => 
                                <div key={bIdx} className='w-full mb-3 p-3 border rounded flex flex-col items-start'>
                                    <div className='w-full p-2 flex gap-2 my-2 bg-neutral-200'>
                                        {!building.edit &&
                                            <Button
                                                sx={{
                                                    boxShadow: "none"
                                                }}
                                                color='primary'
                                                size='small'
                                                variant='contained' 
                                                onClick={() => editBuilding(bIdx)}>Edit</Button>
                                        }
                                        {building.edit && 
                                            <>
                                                <Button
                                                    sx={{
                                                        boxShadow: "none"
                                                    }}
                                                    color='success'
                                                    size='small'
                                                    variant='contained' 
                                                    onClick={() => saveUpdates(bIdx)}>Save</Button>

                                                <Button
                                                    sx={{
                                                        boxShadow: "none"
                                                    }}
                                                    color='dark'
                                                    size='small'
                                                    variant='outlined' 
                                                    onClick={() => setRefresh(r => !r)}>Back</Button>                                            
                                            </>
                                        }                                       
                                    </div>

                                    <label htmlFor="" className='mb-2 flex flex-col'>
                                        Building Name:
                                        <input type='text' name='name' placeholder='ex: main block' onChange={(e) => handleBuildingChange(e, bIdx)} value={building.name} className='bg-neutral-300 rounded px-2' readOnly={!building.edit}/>
                                    </label>
                                    <label htmlFor="" className='flex flex-col'>
                                        Number of Floors:
                                        <input type='text' value={building.noOfFloors} className='bg-neutral-300 rounded px-2' readOnly={true}/>
                                    </label>
                                    {
                                        building.floors.length > 0 ? building.floors.map((floor, fIdx) =>
                                            <div key={fIdx} className='w-full mt-3 p-3 border rounded'>
                                                <label htmlFor="" className='flex'>
                                                    Floor Name:
                                                    <input type='text' name='name' onChange={(e) => handleFloorChange(e, bIdx, fIdx)} value={floor.name} className='ml-2 px-2 bg-neutral-300 rounded' readOnly={!building.edit}/>
                                                </label>
                                                <div className='mt-5 w-full '>
                                                    <h1 className='inline'>ClassRooms:</h1>
                                                    {floor.classRooms.map((classRoom, cRIdx) => 
                                                        <div key={cRIdx} className='w-full mb-1 p-2 flex flex-wrap gap-2 bg-neutral-200 overflow-auto'>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Name:
                                                                <input required type="text" name='name' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)}  placeholder='Class Name'  value={classRoom.name} readOnly={!building.edit}/>
                                                            </label>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Rows:
                                                                <input required type="number" name='rows' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)} placeholder='Rows' value={classRoom.rows} readOnly={!building.edit}/>
                                                            </label>
                                                            <label htmlFor="" className='flex gap-2'>
                                                                Columns:
                                                                <input required type="number" name='columns' onChange={(e) => handleClassChange(e, bIdx, fIdx, cRIdx)}  placeholder='Columns' value={classRoom.columns} readOnly={!building.edit}/>
                                                            </label>
                                                            {building.edit && <Button
                                                                sx={{
                                                                    boxShadow: "none",
                                                                }}
                                                                color='error'
                                                                size='small'
                                                                variant='outlined' 
                                                                onClick={() => deleteClass(bIdx, fIdx, cRIdx)}>Delete</Button>}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex gap-3'>  
                                                    {building.edit && <Button
                                                        sx={{
                                                            boxShadow: "none",
                                                        }}
                                                        color='warning'
                                                        size='small'
                                                        variant='outlined' 
                                                        onClick={() => addNewClassRoom(bIdx, fIdx)}>Add Class</Button>}

                                                    {building.edit && <Button
                                                        sx={{
                                                            boxShadow: "none",
                                                        }}
                                                        color='error'
                                                        size='small'
                                                        variant='contained' 
                                                        onClick={() => deleteFloor(bIdx, fIdx)}>Delete</Button>}
                                                </div>
                                                
                                            </div>
                                        ): <h1>No Floors Added!</h1>
                                    }
                                    {building.edit && <Button onClick={(e) => addNewFloor(bIdx)}>Add Floor</Button>}
                                </div>    
                            ): <p>No Buildings Added</p>}
                        </div>                        
                    </div>
                </div>
            : <h1>Loading..</h1>}
        </div>
    )
}


function AddNewBuilding({setRefresh}) {
    const [building, setBuilding] = useState({name: "", noOfFloors: 0});
    const [floors, setFloors] = useState([]);
    const [classRooms, setClassRooms] = useState([]);
    const user = useSelector(state => state.user);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        let newBuilding = building;
        newBuilding.floors = floors;

        try {
            let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/college/add-building`, {building: newBuilding, collegeId: user.college});
            if(response.status == 200) {
                alert("Added New Building Successfully!");
                setRefresh(r => !r);
            }
        } catch(err) {
            console.log(err);
            alert("Got Error:", err);
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
            updatedFloors[idx].classRooms.push({...classRooms[idx]});
            setFloors([...updatedFloors]);
        }
    }

    return (
        <div className='w-full flex flex-col'>
            <h1 className='text-center'>Add New Building</h1>
            <form onSubmit={handleFormSubmit} className='p-1 border rounded flex flex-col items-start'>
                <label htmlFor="name" className='mb-2 flex flex-col'>
                    Building Name:
                    <input 
                        type="text" 
                        id='name' 
                        value={building.name} 
                        required
                        className='bg-neutral-300 rounded px-2'
                        onChange={(e) => setBuilding(b => {return {...b, name: e.target.value}})}/>  
                </label>
                
                <label htmlFor="noOfFloors" className='flex flex-col'>
                    Number of Floors:
                    <input 
                        type="number" 
                        id='noOfFloors'
                        className='bg-neutral-300 rounded px-2'
                        min={0}
                        value={building.noOfFloors}
                        required
                        onChange={(e) => setBuilding(b => {return {...b, noOfFloors: e.target.value < 101 ? e.target.value : 100}})}/>  
                </label>
                {floors.length > 0 && floors.map((obj, idx) => 
                    <div key={idx} className='mt-3 p-3 border rounded'>
                        <input 
                            type="text" 
                            className='bg-neutral-300 rounded border-0 outline-0 px-2' 
                            placeholder='Floor Name' 
                            value={obj.name}
                            required
                            onChange={(e) => setFloors(f => {f[idx].name = e.target.value; return [...f]})}/>
                        
                        <div className='mt-2 p-2 flex flex-col items-start bg-neutral-300'>
                            <div className='flex gap-2 flex-wrap'>
                                <input required type="text" placeholder='Class Name' name='name' value={classRooms[idx].name} onChange={(e) => handleClassChange(e, idx)}/>
                                <input required type="number" placeholder='Rows' name='rows' value={classRooms[idx].rows} onChange={(e) => handleClassChange(e, idx)}/>
                                <input required type="number" placeholder='Columns' name='columns' value={classRooms[idx].columns} onChange={(e) => handleClassChange(e, idx)}/>    
                            </div>

                            <Button
                                sx={{marginTop: '1rem'}}
                                variant='contained'
                                color='success'
                                size='small'
                                onClick={() => addClassRoom(idx)}
                                >Add Class</Button>
                        </div>
                        <div className='mt-2 bg-neutral-300'>
                            {obj.classRooms && obj.classRooms.length > 0 ?
                                obj.classRooms.map((c, idx) => 
                                    <div key={idx} className='p-2 flex'>
                                        <p className='px-2 bg-neutral-400 rounded mx-1'><span className='font-bold'>Name:</span>{c.name}</p>
                                        <p className='px-2 bg-neutral-400 rounded mx-1'><span className='font-bold'>Rows:</span>{c.rows}</p>
                                        <p className='px-2 bg-neutral-400 rounded mx-1'><span className='font-bold'>Columns:</span>{c.columns}</p>
                                    </div>
                                )                                
                                : <h1>No class rooms added!</h1>}                            
                        </div>
                    </div>
                )}
                <Button
                    sx={{marginTop: '1rem'}}
                    variant='contained'
                    color='success'
                    size='small'
                    type='submit'
                    >Submit</Button>
            </form>            
        </div>
    );
}