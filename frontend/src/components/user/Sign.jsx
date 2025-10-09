import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setHeader } from '../../features/seatingSlice';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export default function Sign() {

    const [isSignIn, setIsSignIn] = useState(true);
    const user = useSelector(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if(user?._id) {
            navigate('/');
        }
    });

    return (
        <div className="w-full h-screen py-10 px-2 flex justify-center items-center">
            <div className="p-5 rounded">
                <div className="">
                    <h1 className='text-neutral-700 text-3xl font-bold'>Welcome To Something</h1>
                </div>
                <div className="py-3 flex flex-col items-center">
                   {isSignIn ? <SignIn/> : <SignUp/>} 
                   {isSignIn ? (
                        <div className="mt-3 flex">
                            <p className="">Don't have a Account ?</p>
                            <p className="ms-2 text-blue-800 underline cursor-pointer" onClick={() => setIsSignIn(!isSignIn)}>click here to Sign-Up</p>
                        </div>
                    ) : (
                        <div className="mt-3 flex">
                            <p className="">Have a Account ?</p>
                            <p className="ms-2 text-blue-800 underline cursor-pointer" onClick={() => setIsSignIn(!isSignIn)}>click here to Sign-In</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SignIn() {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
        <form onSubmit={formik.handleSubmit} className="min-w-9/10 p-3 flex flex-col border border-neutral-400 rounded-xl">
            <h2 className='mb-4 text-2xl font-bold'>Sign In</h2>
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <EmailIcon className="w-2/12"/>
                <input 
                className='ps-3 outline-none w-10/12' 
                type="email" 
                name='email' 
                placeholder='email' 
                value={formik.values.email} 
                onChange={formik.handleChange}
                autoComplete='email'
                required/>
            </div>
            <div className="mt-1 mb-4 p-2 bg-neutral-200 rounded">
                <LockIcon className="w-2/12"/>
                <input 
                className='ps-3 outline-none w-10/12'  
                type="password" 
                name='password' 
                placeholder='password' 
                value={formik.values.password} 
                onChange={formik.handleChange}
                autoComplete="current-password"
                required/>
            </div>
            <Button
                type='submit' 
                loading={loading} 
                disabled={loading} 
                variant='contained' 
                color="dark" 
                sx={{
                    padding: "0.5rem",
                    width: "100%",
                    minHeight: "2.5rem",
                    backgroundColor: "#142424",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                    boxShadow: "none",
                }}
                >{!loading ? "Sign-in" : ""}</Button>
            {status && <p className="">{status}</p>}
        </form>
    );
}


function SignUp() {

    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);  
    const navigate = useNavigate();
    const [college, setCollege] = useState([]);
    const [colleges, setColleges] = useState([]);
    const userTypes = useSelector(state => state.userTypes);
    const collegeShortForm = college.short;
    const dispatch = useDispatch();


    useEffect(() => {
        const getAllColleges = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/college/all`);
                if(response.status == 200) {
                    console.log(response.data.colleges);
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
            type: userTypes[1],
            department: '',
            password: "",
            conPass: "",
        },
        validate: (values) => {
            if ((values.type == "admin") && formik.values.department != college.shortName) {
                formik.setFieldValue("department", college.shortName);
            }
        },
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
        <form onSubmit={formik.handleSubmit} className="min-w-9/10 p-3 flex flex-col border border-neutral-400 rounded">
            <h2 className='mb-4 text-2xl font-bold'>Sign Up</h2>
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <PersonIcon className="w-2/12"/>
                <input 
                    className='ps-3 outline-none w-full'
                    type="name" 
                    name='name' 
                    id='name'
                    placeholder='Name' 
                    value={formik.values.name} 
                    onChange={formik.handleChange}
                    autoComplete='username'
                    required/>
            </div>
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <EmailIcon className="w-2/12"/>
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
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <WorkIcon className="w-2/12"/>
                <select className='w-10/12 ps-3 outline-none' name="college" id="college" value={college.name} onChange={handleCollegeChange}>
                    {colleges.map((obj, idx) => {
                        return (<option value={obj} key={idx}>{obj.name}</option>);
                    })}
                </select>
            </div>
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <WorkIcon className="w-2/12"/>
                <select className='w-10/12 ps-3 outline-none' name="type" id="type" value={formik.values.type} onChange={formik.handleChange}>
                    {userTypes.map((val, idx) => {
                        return (<option value={val} key={idx}>{val}</option>);
                    })}
                </select>
            </div>
            {colleges.length > 0 && <div className="my-1 p-2 bg-neutral-200 rounded">
                <AccountBalanceIcon className="w-2/12"/>
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
            </div>}
            <div className="my-1 p-2 bg-neutral-200 rounded">
                <LockIcon className="w-2/12"/>
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
            <div className="my-1 mb-5 p-2 bg-neutral-200 rounded">
                <LockOpenIcon className="w-2/12"/>
                <input 
                className='w-10/12 ps-3 outline-none' 
                type="password"
                name='conPass' 
                placeholder='confirm password'
                autoComplete='current-password'
                value={formik.values.conPass} 
                onChange={formik.handleChange}
                required/>
            </div>
                <Button
                type='submit' 
                loading={loading} 
                disabled={loading} 
                variant='contained' 
                color="dark" 
                sx={{
                    padding: "0.5rem",
                    width: "100%",
                    minHeight: "2.5rem",
                    backgroundColor: "#142424",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                    boxShadow: "none",
                }}
                >{!loading ? "Sign-up" : ""}</Button>
            {status && <p className="">{status}</p>}
        </form>
    );
}