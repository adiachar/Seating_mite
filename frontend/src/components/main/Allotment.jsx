import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function Allotment() {
    const examReqData = useLocation().state.examReq;
    const [examReq, setExamReq] = useState();
    const college = useSelector(state => state.college);
    const allotmentRefs = useRef([]);
    const printRef = useRef(null);
    const [printClassIdx, setPrintClassIdx] = useState(new Set());

    useEffect(() => {
        let newExamReq = examReqData;
        let noOfStudents = 0;

        for(let allotment of newExamReq.allotment){    
            for(let row of allotment.classRoom.seats) {
                for(let seat of row) {
                    if(seat?.usn != 0) {
                        noOfStudents++;
                    }
                }
            }

            allotment.classRoom.noOfStudents = noOfStudents;
            noOfStudents = 0;
        }
        setExamReq({...newExamReq});
    }, []);

    const getDate = (date) => {
        date = new Date(date);
        return date.toISOString().split('T')[0];
    }

    const handlePrint = () => {

        let content = document.createElement('div');

        for(let idx of printClassIdx) {
            content.appendChild(allotmentRefs.current[idx].cloneNode(true));
        }

        printRef.current = content;

        const printContent = printRef.current;
        const WindowPrt = window.open('', '', 'width=900,height=650');

        const tailwindStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map(node => node.outerHTML)
        .join('');

        WindowPrt.document.write(`
        <html>
            <head>
            <title>Classroom Allotment</title>
            ${tailwindStyles}
            <style>
                @media print {
                @page {
                    margin: 0;
                }
                body {
                    margin: 1rem;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    font-family: Arial, sans-serif;
                }
                * {
                    box-shadow: none;
                }
                button {
                    display: none;
                }
                table, td, th {
                    border-collapse: collapse;
                    border: 1px solid #000;
                }
                }
            </style>
            </head>
            <body>${printContent.outerHTML}</body>
        </html>
        `);
        WindowPrt.document.close();
        WindowPrt.focus();
        WindowPrt.print();
        WindowPrt.close();
    };

    return (
        <div className='w-full p-2 lg:px-10 py-2 bg-gradient-to-br from-blue-100 text-gray-800 flex flex-col gap-10 overflow-auto'>
            {printClassIdx.size !== 0 && <div className='w-full px-5 flex items-center gap-3 justify-end bg-blue-200 rounded-full'>
                <div className='max-w-full p-2 flex gap-2 overflow-auto cursor-pointer'>
                    {Array.from(printClassIdx).map((idx) =>
                        <div key={idx} className='px-2 py-1 border border-gray-400 bg-white rounded-2xl flex gap-2 items-center '>
                            <h1 className='inline'>{examReq.allotment[idx].classRoom.name}</h1>
                            <button
                                className='p-0 m-0 hover:bg-gray-200 flex items-center rounded-full cursor-pointer transition-all'
                                onClick={() => setPrintClassIdx(i => {let newSet = new Set(i); newSet.delete(idx); return newSet})}>
                                <span className="material-symbols-outlined text-gray-400">
                                    close
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handlePrint}
                    className='px-4 py-2 rounded-xl text-sm bg-blue-600 text-gray-200 hover:px-3 hover:scale-110 outline-0 transition-all cursor-pointer flex items-center gap-2'>
                        Print
                        <span className="material-symbols-outlined text-white">
                            print
                        </span>
                    </button>
            </div>}
            {examReq?.allotment && examReq.allotment.map((allotted, idx) => 
                <div className='p-2' key={idx}>
                    <div className='w-full px-2 flex justify-end gap-2'>
                        {allotted.classRoom.isFinalized && <button
                            disabled={printClassIdx.has(idx)}
                            style={printClassIdx.has(idx) ? {backgroundColor: "#D1D5DB"} : {}}
                            onClick={() => setPrintClassIdx(i => {let newSet = new Set(i); newSet.add(idx); return newSet})}
                            className='px-4 py-2 rounded-xl text-sm bg-blue-600 text-gray-200 hover:px-3 hover:scale-100 outline-0 transition-all cursor-pointer flex items-center gap-2'>
                                <span className="material-symbols-outlined">
                                    add
                                </span>
                                Add to print
                        </button>}
                    </div>

                    <div
                        ref={(ele) => (allotmentRefs.current[idx] = ele)}
                        className='w-full my-2 p-5 shadow bg-white flex flex-col text-sm border-b border-b-gray-300'>
                        <div className='w-full flex flex-col'>
                            <div className='mb-2 flex justify-between'>
                                <div className='flex-1'>
                                    <img className='size-10 md:size-25 lg:size-25' src="https://mite.ac.in/wp-content/uploads/2025/03/mite-logo.svg" alt="" />
                                </div>
                                <div className='flex flex-col items-center flex-5 md:flex-4 lg:flex-4 justify-center'>
                                    <h1 className='uppercase text-[9px] lg:text-2xl md:text-2xl font-bold text-center'>{college?.name}</h1>
                                    <p className='text-center text-[8px] lg:text-sm md:text-sm'>(A Unit of Rajalaxmi Education Trust, Mangalore)</p>
                                    <p className=' lg:max-w-4/6 md:max-w-4/6 text-center text-wrap text-[8px] lg:text-sm md:text-sm'>Autonomous Institute affiliated to VTU, Belagavi, Approved by AICTE, New Delhi Accredited by NAAC with A+ Grade & ISO 9001:2015 Certified Institution</p>
                                </div>
                                <div className='w-full flex-1 hidden lg:flex'>
                                    
                                </div>                            
                            </div>
                            <div className='my-1 flex justify-between font-semibold lg:text-sm md:text-sm text-[9px]'>
                                <p className='flex gap-2'><span>Date:</span><span>{getDate(examReq?.date)}</span></p>
                                {examReq?.time && <p><span>Time:</span><span>{examReq.time}</span></p>}
                            </div>
                        </div>
                        <div className='w-full flex gap-3 font-semibold lg:text-sm md:text-sm text-[9px]'>
                            <p className='w-full flex justify-center gap-2'><span>Classroom:</span><span>{allotted.classRoom.name}</span></p>
                            <span className='mr-2 px-2 font-normal text-gray-600 text-nowrap'>{allotted.classRoom.isFinalized ? 'Finalized' : 'Not Finalized'}</span>               
                        </div>
                        <table className='w-full mt-1 lg:mt-3 md:mt-3 border table-fixed '>
                            <tbody className='divide-y'>
                                {allotted.classRoom.seats.map((row, rIdx) => 
                                    <tr key={rIdx} className=''>
                                        {row.map((student, cIdx) => 
                                            <td key={cIdx} className=' p-2 border-r text-center'>
                                                <h1 className='lg:text-sm md:text-sm text-[7px]'>{student.usn != 0 && student.usn}</h1>
                                            </td>
                                        )}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className=' mt-1 md:mt-5 lg:mt-5 flex flex-col lg:text-sm md:text-sm text-[9px]'>
                            <p className='my-1 lg:my-2 md:my-2 font-semibold'>Total Students Seated: {allotted.classRoom.noOfStudents}</p>
                            <p className='my-1 text-end lg:text-sm md:text-sm text-[8px]'>Invigilator Signature: _______________________</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
