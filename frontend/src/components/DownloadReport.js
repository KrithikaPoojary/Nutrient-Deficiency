import jsPDF from "jspdf";

import html2canvas from "html2canvas";

const downloadReport = async () => {

  const input = document.getElementById(
    "full-report-download"
  );

  if (!input) {

    alert(
      "Report section not found"
    );

    return;
  }

  try {

    // =====================================
    // SCREENSHOT
    // =====================================

    const canvas =
      await html2canvas(input, {

        scale: 2,

        useCORS: true,

        scrollY:
          -window.scrollY

      });

    // =====================================
    // IMAGE
    // =====================================

    const imgData =
      canvas.toDataURL(
        "image/png"
      );

    // =====================================
    // PDF
    // =====================================

    const pdf =
      new jsPDF(

        "p",
        "mm",
        "a4"

      );

    const pdfWidth =
      pdf.internal.pageSize
      .getWidth();

    const pdfHeight =
      pdf.internal.pageSize
      .getHeight();

    const imgWidth =
      pdfWidth;

    const imgHeight =
      (
        canvas.height *
        imgWidth
      ) / canvas.width;

    let heightLeft =
      imgHeight;

    let position = 0;

    // =====================================
    // FIRST PAGE
    // =====================================

    pdf.addImage(

      imgData,
      "PNG",

      0,
      position,

      imgWidth,
      imgHeight

    );

    heightLeft -=
      pdfHeight;

    // =====================================
    // MULTIPLE PAGES
    // =====================================

    while (heightLeft > 0) {

      position =
        heightLeft -
        imgHeight;

      pdf.addPage();

      pdf.addImage(

        imgData,
        "PNG",

        0,
        position,

        imgWidth,
        imgHeight

      );

      heightLeft -=
        pdfHeight;
    }

    // =====================================
    // SAVE
    // =====================================

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
