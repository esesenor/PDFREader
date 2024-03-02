import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = () => {
  const [file, setFile] = useState(null);
  const [numerosTransferencia, setNumerosTransferencia] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const extractNumerosTransferencia = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = new Uint8Array(e.target.result);
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      let numeros = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((textItem) => {
          const numeroTransferenciaRegex = /IST-0*(\d+)/g;
          const matches = textItem.str.matchAll(numeroTransferenciaRegex);
          for (const match of matches) {
            let numero = "IST " + match[1].replace(/^0+/, "");
            numeros.push(numero);
          }
        });
      }
      setNumerosTransferencia(numeros);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      className="flex flex-col justify-center items-center gap-6 m-10
     bg-gradient-to-l from-teal-300 via-sky-950 to-sky-600"
    >
      <h1 className="text-rose-100 p-4 text-xl">
        Extraer Números de Transferencia{" "}
      </h1>
      <input type="file" onChange={handleFileChange} className="m-10" />
      <button
        onClick={extractNumerosTransferencia}
        className="bg-rose-500 text-[#020202] w-[300px] 
        p-4 shadow-sm shadow-gray-300 transition-all text-lg font-bold
        hover:-translate-y-1 hover:shadow-lg hover:shadow-white"
      >
        Extraer Números
      </button>
      <div className="m-10 text-white flex flex-col justify-center items-center">
        <h2 className="">Lista Números de Transferencia:</h2>
        <ul>
          {numerosTransferencia.map((numero, index) => (
            <li key={index}>{numero}</li>
          ))}
        </ul>
      </div>
      {/* {file && (
        <div style={{ marginTop: "20px" }}>
          <Document file={file}>
            {Array.from(new Array(file.numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        </div>
      )} */}
    </div>
  );
};

export default PDFReader;
