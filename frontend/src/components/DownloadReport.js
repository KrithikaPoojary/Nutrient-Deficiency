import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const downloadReport = async () => {

  const input = document.getElementById("report");

  if (!input) {

    alert("Report section not found");

    return;

  }

  try {

    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 5;

    const imgWidth =
      pdfWidth - (margin * 2);

    const imgHeight =
      (canvas.height * imgWidth) /
      canvas.width;

    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pdfHeight;

    while (heightLeft > 0) {

      position =
        heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pdfHeight;

    }

    pdf.save(
      "AI_Nutrition_Report.pdf"
    );

  }

  catch (error) {

    console.error(
      "PDF ERROR:",
      error
    );

    alert(
      "PDF generation failed"
    );

  }

};

export default downloadReport;