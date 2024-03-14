import { useState } from "react";
import { pdfjs } from "react-pdf";

//             ..|..

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFReader = () => {
  const [file, setFile] = useState(null);
  const [numeros, setNumeros] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const extractNumeros = async () => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const pdfData = new Uint8Array(e.target.result);
      const pdf = await pdfjs.getDocument({ data: pdfData }).promise;

      const promises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        promises.push(extractNumerosFromPage(pdf, i));
      }

      Promise.all(promises)
        .then((result) => {
          const numerosTransferencia = result.flatMap(
            (r) => r.numerosTransferencia
          );
          const numerosRequisicion = result.flatMap(
            (r) => r.numerosRequisicion
          );
          setNumeros(
            numerosTransferencia.map((transferencia, index) => ({
              transferencia,
              requisicion: numerosRequisicion[index],
            }))
          );
        })
        .catch((error) => console.error("Error extracting numbers:", error));
    };
    reader.readAsArrayBuffer(file);
  };

  const extractNumerosFromPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const numerosTransferencia = [];
    const numerosRequisicion = [];

    const numeroTransferenciaRegex = /IST-0*(\d+)/g;
    const numeroRequisicionRegex = /VRR-0*(\d+)/g;

    textContent.items.forEach((textItem) => {
      let match;
      while ((match = numeroTransferenciaRegex.exec(textItem.str)) !== null) {
        const numero = "IST " + match[1].replace(/^0+/, "");
        numerosTransferencia.push(numero);
      }

      while ((match = numeroRequisicionRegex.exec(textItem.str)) !== null) {
        const numero = "VRR " + match[1].replace(/^0+/, "");
        numerosRequisicion.push(numero);
      }
    });

    return { numerosTransferencia, numerosRequisicion };
  };

  return (
    <div className="flex flex-col justify-center items-center gap-6 bg-sky-950 w-full h-full">
      <h1 className="text-rose-100 p-4 text-xl text-center">
        Listar Números de Transferencia y Requisición
      </h1>
      <input type="file" onChange={handleFileChange} className="m-10" />
      <button
        onClick={extractNumeros}
        className="bg-rose-300 text-[#020202] w-[300px] p-4 shadow-sm shadow-gray-300 transition-all text-lg font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-white"
      >
        Extraer Números
      </button>
      <div className="m-10 text-white">
        <h2 className="mb-2 text-center text-2xl font-bold">Resultado</h2>
        <table className="table-auto text-center w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">No. Transferencia</th>
              <th className="px-4 py-2">No. Requisición</th>
            </tr>
          </thead>
          <tbody>
            {numeros.map(({ transferencia, requisicion }, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{transferencia}</td>
                <td className="border px-4 py-2">{requisicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PDFReader;
