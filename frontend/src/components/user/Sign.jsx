import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setHeader, setCollege } from '../../features/seatingSlice';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Button } from '@mui/material';

let bgColor = {student: "", coordinator: "", admin: ""}

export default function Sign() {

    const [isSignIn, setIsSignIn] = useState(true);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();
    const [userType, setUserType] = useState('student');

    useEffect(() => {
        if(user?._id) {
            navigate('/home');
        }
    }, []);

    return (
        <div className={`w-full h-full  py-2 px-2 flex justify-center items-center bg-gradient-to-br ${userType === 'student' ? 'from-blue-600 to-sky-600': userType === 'coordinator' ? 'from-purple-600 to-pink-500': 'from-red-600 to-orange-500'}`}>

            <div className="px-5 lg:px-40 py-5 w-full h-full overflow-auto rounded flex flex-col lg:flex-row gap-5 text-white">

                <div className='lg:w-1/2 flex flex-col gap-6'>
                    <div className='flex gap-4 items-center'>
                        <span 
                            className="material-symbols-outlined p-3 bg-white/20 rounded-2xl"
                            style={{fontSize: "2.5rem"}}>
                            school
                        </span>
                        <div className='flex flex-col gap-1 justify-center'>
                            <h1 className='text-2xl font-medium'>Seating Arrangement Management System</h1>
                            <p className='text-sm'>Autonomouse system for allotting seats for college exams</p>
                        </div>
                    </div>
                    <div>

                        <p className=''>
                            Select your role:
                        </p>

                        <div className='mt-2 flex flex-col'>
                            <button 
                                className={`p-3 mb-3 flex gap-3 border-2 rounded-xl ${userType === 'student' ? 'bg-white/30 border-white/80' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
                                onClick={() => setUserType('student')}>
                                <span 
                                    className="material-symbols-outlined p-3 bg-white/20 rounded-xl"
                                    style={{fontSize: "1.7rem"}}>
                                    import_contacts
                                </span>
                                <div className='flex flex-col justify-center'>
                                    <h1 className='text-start text'>Student</h1>
                                    <p className='text-sm text-white/80'>Access your seating assignments</p>
                                </div>
                            </button>

                            <button 
                                className={`p-3 mb-3 flex gap-3 border-2 rounded-xl ${userType === 'coordinator' ? 'bg-white/30 border-white/80' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
                                onClick={() => setUserType('coordinator')}>
                                <span 
                                    className="material-symbols-outlined p-3 bg-white/20 rounded-xl"
                                    style={{fontSize: "1.7rem"}}>
                                    group
                                </span>
                                <div className='flex flex-col justify-center'>
                                    <h1 className='text-start text'>Coordinator</h1>
                                    <p className='text-sm text-white/80'>Manage eligible students for exams</p>
                                </div>
                            </button>

                            <button 
                                className={`p-3 mb-3 flex gap-3 border-2 rounded-xl ${userType === 'admin' ? 'bg-white/30 border-white/80' : 'border-white/30 bg-white/10 hover:bg-white/20'}`}
                                onClick={() => setUserType('admin')}>
                                <span 
                                    className="material-symbols-outlined p-3 bg-white/20 rounded-xl"
                                    style={{fontSize: "1.7rem"}}>
                                    shield
                                </span>
                                <div className='flex flex-col justify-center'>
                                    <h1 className='text-start text'>Administrator</h1>
                                    <p className='text-sm text-white/80'>Full system access and control</p>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex gap-3 items-center'>
                            <span 
                                className="material-symbols-outlined p-2 bg-white/20 rounded-xl"
                                style={{fontSize: "1.4rem"}}>
                                lock_person
                            </span>
                            <div className='flex flex-col justify-center'>
                                <h1 className='text-start font-semibold'>Secure Access</h1>
                                <p className='text-sm text-white/80'>Role based authentication system</p>
                            </div>
                        </div>
                        <div className='flex gap-3 items-center'>
                            <span 
                                className="material-symbols-outlined p-2 bg-white/20 rounded-xl"
                                style={{fontSize: "1.4rem"}}>
                                school
                            </span>
                            <div className='flex flex-col justify-center'>
                                <h1 className='text-start font-semibold'>Easy Management</h1>
                                <p className='text-sm text-white/80'>Intuitive seating arrangement interface</p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="lg:w-1/2 h-auto w-full self-start p-8 flex flex-col bg-white rounded-2xl">
                    <div className='w-full mb-2 p-1 bg-gray-200 flex text-black font-semibold text-sm rounded-2xl'>
                        <button 
                            className={`w-1/2 py-1 rounded-2xl ${isSignIn && 'bg-white'}`}
                            onClick={() => setIsSignIn(true)}
                            >Login</button>
                        <button 
                            onClick={() => setIsSignIn(false)}
                            className={`w-1/2 py-1 rounded-2xl ${!isSignIn && 'bg-white'}`}>Sign Up</button>
                    </div>
                    {isSignIn ? userType === 'student'? <StudentSignIn/> : <SignIn userType={userType}/> : userType === 'student' ? <StudentSignUp/> : <SignUp userType={userType}/>} 
                </div>
            </div>
        </div>
    )
}

function SignIn({userType}) {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getCollege = async (user) => {
        try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${user.college}`);
        if(response.status === 200) {
            dispatch(setCollege(response.data.college))
        }
        } catch(err) {
            console.log(err);
            alert("Got error from the server while getting the college data");
        }
    }

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validate: () => {},
        onSubmit: async (values) => {
            if(!values.email || !values.password) {
                setStatus("Fields Can't be Empty");
            }

            setLoading(true);
            try {
                let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/sign-in`, values);

                if(response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    dispatch(setUser(response.data.user));
                    dispatch(setHeader(response.data.token));
                    getCollege(response.data.user);
                    navigate("/");
                }
            } catch (err) {
                if(err.response) {
                    setStatus(err.response.data.message);
                    setLoading(false);
                }
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} className="w-full py-6 flex flex-col  border-neutral-400 rounded-2xl text-gray-800">
            <div className='mb-3 flex gap-2 items-center'>
                <span 
                    className="material-symbols-outlined"
                    style={{fontSize: "1.5rem"}}>
                    import_contacts
                </span>
                <h1 className='text-xl font-semibold capitalize'>{userType} Login</h1>
            </div>
            <p className='mb-3 text-gray-500'>Enter your credentials to access the system</p>
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                Email Address
                <div className='p-2 bg-neutral-100 rounded-xl flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        email
                    </span>
                    <input 
                    className='w-10/12 ps-3 outline-none font-medium' 
                    type="email" 
                    name='email' 
                    placeholder='Enter your email' 
                    value={formik.values.email} 
                    onChange={formik.handleChange}
                    autoComplete='email'
                    required/>                    
                </div>
            </label>
            <label className="text-sm font-semibold flex flex-col gap-2">
                Password
                <div className='p-2 bg-neutral-100 rounded-xl flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        lock
                    </span>
                    <input 
                    className='ps-3 outline-none w-10/12'  
                    type="password" 
                    name='password' 
                    placeholder='Enter your password' 
                    value={formik.values.password} 
                    onChange={formik.handleChange}
                    autoComplete="current-password"
                    required/>
                </div>
            </label>
            <Button
                type='submit' 
                loading={loading} 
                disabled={loading} 
                variant='contained' 
                color="dark" 
                sx={{
                    minHeight: "2.2rem",
                    marginTop: "1rem",
                    padding: "0rem 1rem",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textTransform: "capitalize",
                    borderRadius: "0.5rem",
                }}
                >{!loading ? "Sign In" : ""}</Button>
            {status && <p className="mt-3 text-center text-red-600">{status}</p>}
        </form>
    );
}


function SignUp({userType}) {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);  
    const navigate = useNavigate();
    const [college, setCollege] = useState({});
    const [colleges, setColleges] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const getAllColleges = async () => {
            try {
                console.log(`${import.meta.env.VITE_SERVER_URL}/college/all`);
                const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/all`);
                if(response.status == 200) {
                    setColleges(response.data.colleges);
                    setCollege(response.data.colleges[0]);
                }                
            } catch(err) {
                console.log(err);
            }
        }
        getAllColleges();
    }, []);

    useEffect(() => {
        formik.setFieldValue('type', userType);
        if(userType === 'admin') {
            formik.setFieldValue('dep')
        }
    }, [userType]);

    useEffect(() => {
        if(college._id) {
            if(userType === 'admin') {
                formik.setFieldValue('department', college.shortName);

            } else {
                formik.setFieldValue('department', Object.keys(college.departments)[0]);
            }
        }
    }, [college]);

    const handleCollegeChange = (e) => {
        setCollege(e.target.value);
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            type: userType,
            department: '',
            password: "",
            conPass: "",
        },
        validate: (values) => {},

        onSubmit: async (values) => {
            if(values.conPass != values.password) {
                return setStatus("Passwords didn't match!");
            }
            setLoading(true);
            values.college = college._id;
            try {
                let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/sign-up`, values);

                if(response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    dispatch(setUser(response.data.user));
                    dispatch(setHeader(response.data.token));
                    dispatch(setCollege(college));
                    setLoading(false);
                    navigate("/home");
                }

            } catch (err) {
                if(err.response) {
                    setStatus(err.response.data.message);
                    setLoading(false);
                }
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} className="w-full py-6 flex flex-col  border-neutral-400 rounded-2xl text-gray-800">
            <div className='mb-3 flex gap-2 items-center'>
                <span 
                    className="material-symbols-outlined"
                    style={{fontSize: "1.5rem"}}>
                    import_contacts
                </span>
                <h1 className='text-xl font-semibold capitalize'>{userType} Registration</h1>
            </div>
            
            <p className='mb-3 text-gray-500'>Create a new account</p>
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                Full Name
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        person
                    </span>
                    <input 
                        className='ps-3 outline-none w-full'
                        type="name" 
                        name='name' 
                        id='name'
                        placeholder='John Doe' 
                        value={formik.values.name} 
                        onChange={formik.handleChange}
                        autoComplete='username'
                        required/>
                </div>
            </label>
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2 ">
                Email Address
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        email
                        </span>
                    <input 
                        className='ps-3 outline-none' 
                        type="email" 
                        name='email' 
                        placeholder='email' 
                        value={formik.values.email} 
                        onChange={formik.handleChange}
                        autoComplete='email'
                        required/>
                </div>
            </label>
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                College
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        school
                    </span>
                    <select className='w-10/12 ps-3 outline-none' name="college" id="college" value={college.name} onChange={handleCollegeChange}>
                        {colleges.map((obj, idx) => {
                            return (<option value={obj} key={idx}>{obj.name}</option>);
                        })}
                    </select>
                </div>
            </label>

            {(colleges.length > 0 && (formik.values.type === "student" || formik.values.type === "coordinator" )) &&
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                Department
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        domain
                    </span>
                    <select 
                        className='w-10/12 ps-3 outline-none' 
                        name="department" 
                        id="department" 
                        value={formik.values.department} 
                        onChange={formik.handleChange}>
                        {(formik.values.type === "student" || formik.values.type === "coordinator" ) ? Object.keys(college.departments).map((val, idx) => {
                            return (<option value={val} key={idx}>{val}</option>);
                        }) : <option value={college.shortName}>{college.shortName}</option>}
                    </select>
                </div>
            </label>}

            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                Password
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        lock
                    </span>
                    <input 
                    className='w-10/12 ps-3 outline-none' 
                    type="password" 
                    name='password' 
                    placeholder='password' 
                    autoComplete="current-password"
                    value={formik.values.password} 
                    onChange={formik.handleChange}
                    required/>
                </div>
            </label>

            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                Confirm Password
                <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        lock_reset
                    </span>
                    <input 
                    className='w-10/12 ps-3 outline-none' 
                    type="password"
                    name='conPass' 
                    placeholder='Re-enter your password'
                    autoComplete='current-password'
                    value={formik.values.conPass} 
                    onChange={formik.handleChange}
                    required/>
                    </div>
            </label>
                <Button
                type='submit' 
                loading={loading} 
                disabled={loading} 
                variant='contained' 
                color="dark" 
                sx={{
                    minHeight: "2.2rem",
                    marginTop: "1rem",
                    padding: "0rem 1rem",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textTransform: "capitalize",
                    borderRadius: "0.5rem",
                }}
                >{!loading ? "Create Account" : ""}</Button>
            {status && <p className="mt-3 text-center text-red-600">{status}</p>}
        </form>
    );
}

function StudentSignUp() {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);  
    const navigate = useNavigate();
    const [college, setCollege] = useState({});
    const [colleges, setColleges] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const getAllColleges = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/all`);
                if(response.status == 200) {
                    setColleges(response.data.colleges);
                    setCollege(response.data.colleges[0]);
                }                
            } catch(err) {
                console.log(err);
            }
        }
        getAllColleges();
    }, []);



    const handleCollegeChange = (e) => {
        setCollege(e.target.value);
    }

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            usn: "",
            semester: 1, 
            department: '',
            phoneNo: '',
            password: "",
            conPass: "",
        },

        validate: (values) => {},

        onSubmit: async (values) => {
            if(values.conPass != values.password) {
                return setStatus("Passwords didn't match!");
            }

            setLoading(true);
            values.college = college._id;

            try {
                let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/student/sign-up`, values);

                if(response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    dispatch(setUser(response.data.user));
                    dispatch(setHeader(response.data.token));
                    dispatch(setCollege(college))
                    navigate("/");
                }

            } catch (err) {
                if(err.response) {
                    setStatus(err.response.data.message);
                    setLoading(false);
                }
            }
        }
    });

    useEffect(() => {
        if(college._id) {
            formik.setFieldValue('department', Object.keys(college.departments)[0]);
        }
    }, [college]);

    return (
        <form onSubmit={formik.handleSubmit} className="w-full py-6 flex flex-col  border-neutral-400 rounded-2xl text-gray-800">
            <div className='mb-3 flex gap-2 items-center'>
                <span 
                    className="material-symbols-outlined"
                    style={{fontSize: "1.5rem"}}>
                    import_contacts
                </span>
                <h1 className='text-xl font-semibold capitalize'>Student Registration</h1>
            </div>
            
            <p className='mb-3 text-gray-500'>Create a new account</p>
            <div className='max-h-90 overflow-auto'>
                <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                    Full Name
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            person
                        </span>
                        <input 
                            className='ps-3 outline-none w-full'
                            type="name" 
                            name='name' 
                            id='name'
                            placeholder='John Doe' 
                            value={formik.values.name} 
                            onChange={formik.handleChange}
                            autoComplete='username'
                            required/>
                    </div>
                </label>
                <label className="mb-2 text-sm font-semibold flex flex-col gap-2 ">
                    Email Address
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            email
                            </span>
                        <input 
                            className='ps-3 outline-none' 
                            type="email" 
                            name='email' 
                            placeholder='email' 
                            value={formik.values.email} 
                            onChange={formik.handleChange}
                            autoComplete='email'
                            required/>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2 ">
                    USN
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            id_card
                            </span>
                        <input 
                            className='ps-3 outline-none' 
                            type="text" 
                            name='usn' 
                            placeholder='ex: 4mt22is002' 
                            value={formik.values.usn} 
                            onChange={formik.handleChange}
                            autoComplete='usn'
                            required/>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2 ">
                    Semester
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            menu_book
                        </span>
                        <input 
                            className='ps-3 outline-none' 
                            type="number" 
                            name='semester' 
                            min={1}
                            max={8}
                            placeholder='Enter Your Semester' 
                            value={formik.values.semester} 
                            onChange={formik.handleChange}
                            autoComplete='semester'
                            required/>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2 ">
                    Phone Number
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            call
                            </span>
                        +91 
                        <input 
                            className='ps-3 outline-none' 
                            type="number" 
                            name='phoneNo' 
                            placeholder='Enter Your Phone Number' 
                            value={formik.values.phoneNo} 
                            onChange={formik.handleChange}
                            autoComplete='phoneNo'
                            required/>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                    College
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            school
                        </span>
                        <select className='w-10/12 ps-3 outline-none' name="college" id="college" value={college.name} onChange={handleCollegeChange}>
                            {colleges.map((obj, idx) => {
                                return (<option value={obj} key={idx}>{obj.name}</option>);
                            })}
                        </select>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                    Department
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            domain
                        </span>
                        <select 
                            className='w-10/12 ps-3 outline-none' 
                            name="department" 
                            id="department" 
                            value={formik.values.department} 
                            onChange={formik.handleChange}>
                            {college?.name && Object.keys(college.departments).map((val, idx) => 
                                <option value={val} key={idx}>{val}</option>
                            )}
                        </select>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                    Password
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            lock
                        </span>
                        <input 
                        className='w-10/12 ps-3 outline-none' 
                        type="password" 
                        name='password' 
                        placeholder='password' 
                        autoComplete="current-password"
                        value={formik.values.password} 
                        onChange={formik.handleChange}
                        required/>
                    </div>
                </label>

                <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                    Confirm Password
                    <div className='p-2 bg-neutral-100 rounded-xl font-normal flex items-center'>
                        <span 
                            className="material-symbols-outlined text-gray-500"
                            style={{fontSize: "1.5rem"}}>
                            lock_reset
                        </span>
                        <input 
                        className='w-10/12 ps-3 outline-none' 
                        type="password"
                        name='conPass' 
                        placeholder='Re-enter your password'
                        autoComplete='current-password'
                        value={formik.values.conPass} 
                        onChange={formik.handleChange}
                        required/>
                    </div>
                </label>
            </div>
            <Button
            type='submit' 
            loading={loading} 
            disabled={loading} 
            variant='contained' 
            color="dark" 
            sx={{
                minHeight: "2.2rem",
                marginTop: "1rem",
                padding: "0rem 1rem",
                backgroundColor: "black",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "capitalize",
                borderRadius: "0.5rem",
            }}
            >{!loading ? "Create Account" : ""}</Button>
            {status && <p className="mt-3 text-center text-red-600">{status}</p>}
        </form>
    );
}


function StudentSignIn() {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getCollege = async (user) => {
        try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/${user.college}`);
        if(response.status === 200) {
            dispatch(setCollege(response.data.college))
        }
        } catch(err) {
            console.log(err);
            alert("Got error from the server while getting the college data");
        }
    }

    const formik = useFormik({
        initialValues: {
            usn: "",
            password: "",
        },
        validate: () => {},
        onSubmit: async (values) => {
            if(!values.usn || !values.password) {
                setStatus("Fields Can't be Empty");
            }

            setLoading(true);

            try {
                let response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/user/student/sign-in`, values);

                if(response.status === 200) {
                    localStorage.setItem("token", response.data.token);
                    dispatch(setUser(response.data.user));
                    dispatch(setHeader(response.data.token));
                    getCollege(response.data.user);
                    navigate("/home");
                }
            } catch (err) {
                if(err.response) {
                    setStatus(err.response.data.message);
                    setLoading(false);
                }
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit} className="w-full py-6 flex flex-col  border-neutral-400 rounded-2xl text-gray-800">
            <div className='mb-3 flex gap-2 items-center'>
                <span 
                    className="material-symbols-outlined"
                    style={{fontSize: "1.5rem"}}>
                    import_contacts
                </span>
                <h1 className='text-xl font-semibold capitalize'>Student Login</h1>
            </div>
            <p className='mb-3 text-gray-500'>Enter your credentials to access the system</p>
            <label className="mb-2 text-sm font-semibold flex flex-col gap-2">
                USN
                <div className='p-2 bg-neutral-100 rounded-xl flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        id_card
                    </span>
                    <input 
                    className='w-10/12 ps-3 outline-none font-medium' 
                    type="text" 
                    name='usn' 
                    placeholder='ex: 4mt22is002' 
                    value={formik.values.usn} 
                    onChange={formik.handleChange}
                    autoComplete='usn'
                    required/>                    
                </div>
            </label>
            <label className="text-sm font-semibold flex flex-col gap-2">
                Password
                <div className='p-2 bg-neutral-100 rounded-xl flex items-center'>
                    <span 
                        className="material-symbols-outlined text-gray-500"
                        style={{fontSize: "1.5rem"}}>
                        lock
                    </span>
                    <input 
                    className='ps-3 outline-none w-10/12'  
                    type="password" 
                    name='password' 
                    placeholder='Enter your password' 
                    value={formik.values.password} 
                    onChange={formik.handleChange}
                    autoComplete="current-password"
                    required/>
                </div>
            </label>
            <Button
                type='submit' 
                loading={loading} 
                disabled={loading} 
                variant='contained' 
                color="dark" 
                sx={{
                    minHeight: "2.2rem",
                    marginTop: "1rem",
                    padding: "0rem 1rem",
                    backgroundColor: "black",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textTransform: "capitalize",
                    borderRadius: "0.5rem",
                }}
                >{!loading ? "Sign In" : ""}</Button>
            {status && <p className="mt-3 text-center text-red-600">{status}</p>}
        </form>
    );
}