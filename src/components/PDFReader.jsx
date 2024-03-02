import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = () => {
  const [file, setFile] = useState(null);
  const [numerosTransferencia, setNumerosTransferencia] = useState([]);
  const [numerosRequisicion, setNumerosRequisicion] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const extractNumerosTransferencia = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = new Uint8Array(e.target.result);
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
      let numerosTransferencia = [];
      let numerosRequisicion = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((textItem) => {
          const numeroTransferenciaRegex = /IST-0*(\d+)/g;
          const numeroRequisicionRegex = /VRR-0*(\d+)/g;
          const matchesTransferencia = textItem.str.matchAll(
            numeroTransferenciaRegex
          );
          const matchesRequisicion = textItem.str.matchAll(
            numeroRequisicionRegex
          );
          for (const match of matchesTransferencia) {
            let numero = "IST " + match[1].replace(/^0+/, "");
            numerosTransferencia.push(numero);
          }
          for (const match of matchesRequisicion) {
            let numero = "VRR " + match[1].replace(/^0+/, "");
            numerosRequisicion.push(numero);
          }
        });
      }
      setNumerosTransferencia(numerosTransferencia);
      setNumerosRequisicion(numerosRequisicion);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6 bg-sky-950 w-full h-full">
      <h1 className="text-rose-100 p-4 text-xl">
        Extraer Números de Transferencia y Requisición
      </h1>
      <input type="file" onChange={handleFileChange} className="m-10" />
      <button
        onClick={extractNumerosTransferencia}
        className="bg-rose-300 text-[#020202] w-[300px] p-4 shadow-sm shadow-gray-300 transition-all text-lg font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-white"
      >
        Extraer Números
      </button>
      <div className="m-10 text-white">
        <h2 className="mb-2 text-center">
          Listado de Números de Transferencia y Requisición:
        </h2>
        <table className="table-auto text-center w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Número de Transferencia</th>
              <th className="px-4 py-2">Número de Requisición</th>
            </tr>
          </thead>
          <tbody>
            {numerosTransferencia.map((transferencia, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{transferencia}</td>
                <td className="border px-4 py-2">
                  {numerosRequisicion[index]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* {file && (
        <div className="m-10 w-full">
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
