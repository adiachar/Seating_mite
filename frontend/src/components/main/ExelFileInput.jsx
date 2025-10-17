import * as XLSX from 'xlsx';


export default function ExelFileInput({setData}) {
    function handleFileUpload(event) {
        const render = new FileReader();
        render.readAsArrayBuffer(event.target.files[0]);
        render.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setData(jsonData);
        }
    }

    return (
        <input 
            className='w-full mb-3 p-2 border border-gray-300 rounded-2xl bg-gray-100 text-sm'
            type="file" 
            accept='.xlsx, xls'
            onChange={handleFileUpload}
            required/>
    );
}