import * as dcmjs from "dcmjs"

export function anonymizeInfo(buffer) {
    const dicom = dcmjs.data.DicomMessage.readFile(buffer)

    if (dicom.meta["00020010"]?.Value?.[0] ===
        "1.2.840.10008.1.2.1.99"
    ) {
        throw new Error("not supported.")
    }

    dicom.dict["00100010"] = {
        vr: "PN",
        Value:[{Alphabetic: "ANONYMOUS"}],
    }

    return dicom.write()
}