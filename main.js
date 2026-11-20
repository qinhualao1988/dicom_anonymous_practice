import * as dcmjs from "dcmjs"
import { anonymizeInfo } from "./anonymizeInfo.js"

const fileInput = document.getElementById("dicomFile")    // file input area defined
const button = document.getElementById("anonymizeBtn")    // 'anonymize' button

fileInput.addEventListener("change", function() {
    const file = fileInput.files[0]

    if (!file) {
        window.alert("use DICOM file")
        return
    }

    file.arrayBuffer()
        .then(buffer => {
            logWholeDcm("Original .dcm: ",buffer)
        })
        .catch(error => console.error("failed to read original dcm file", error))

})
button.addEventListener("click", function() {
    const file = fileInput.files[0]
    
    if (!file) {
        window.alert("use DICOM file")
        return
    }

    file.arrayBuffer()    // use 'arrayBuffer() to read .dcm file
        .then(buffer => {
            const originName = readPatientName(buffer, "00100010")
            const output = anonymizeInfo(buffer)

            console.table([
                {File: "original DICOM", PatientName: originName},
                {File: "exported DICOM", PatientName: readPatientName(output,"00100010")}
            ])

            return output
        })
        .then(output => {

            // testing results
            logWholeDcm("anonymous .dcm: ", output)

            /*
             * Blob => Binary Large Object
             * [output] => data from anonymizeInfo()
             * type: "application/dicom" => MIME type for browser recognize
             */
            const blob = new Blob(
                [output], 
                {type: "application/dicom"}
            )

            const url = URL.createObjectURL(blob)    // create temp url for blob
            const link = document.createElement("a")

            link.href = url
            link.download = "patient-name-anonymous.dcm"

            document.body.append(link)
            link.click()
            link.remove()
            setTimeout(
                () => URL.revokeObjectURL(url),
                1000
            )
        })
        .catch((error) => {
            window.alert(`DICOM processing failed: ${error.message}`)
        }) 
})

// helper function for reading dcm info by tag
function readPatientName(buffer, tag) {
    const dicom = dcmjs.data.DicomMessage.readFile(buffer, {
        untilTag: tag,
        includeUntilTagValue: true,
    })

    const value = dicom.dict[tag]?.Value

    return dcmjs.utilities.dicomJson.pnObjectToString(value) || "empty or missing"
}

// helper 
function logWholeDcm(label, buffer) {
    const dicom = dcmjs.data.DicomMessage.readFile(buffer)

    console.log(label, dicom)
}