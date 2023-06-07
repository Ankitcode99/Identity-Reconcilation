const pool = require('../db')

const createNewContact= async function(email, phoneNumber) {

    result = await pool.query(
        "INSERT INTO public.contact(email, phoneNumber, linkedId, linkPrecedence, deletedAt) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [email, phoneNumber, null, "primary",null])

    return result.rows;
}

const createSecondaryContact= async function(data, matchedRecord) {
    var {email, phoneNumber} = data;
    
    result = await pool.query(
        "INSERT INTO public.contact(email, phoneNumber, linkedId, linkPrecedence, deletedAt) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [email, phoneNumber, matchedRecord.id, "secondary",null]);
            
    let linkedContacts = [matchedRecord, result.rows[0]]
    return linkedContacts;
}

const linkMatchingRecords= async function(data, records) {

    /**
     * linkMatchingRecords Logic:
     * 1. From the fetch set of records extract the primary ones except the oldest record as it will be the new primary for all.
     * 2. Get all secondary records linked to the oldest primary record.
     * 3. Now link all the primary records extracted in (1) to the old primary record id and make them secondary.
     * 4. Link all the secondary records which we linked to records extracted in (1) to the oldest primary record id.
     * 5. Create a new secondary record for the given input
     * 
     * Note: The approach is to always keep only a 2-LEVEL hierarchy for all primary and secondary records
     */

    const primaryRecordId = records[0].id;

    const otherPrimaryContactId = records
                                        .filter(record => record.linkprecedence === "primary" && record.id !== primaryRecordId)
                                        .map(record => record.id);

    const existingSecondaryRecords = await pool.query(
        `SELECT * FROM public.contact Where linkPrecedence='secondary' AND linkedId=${primaryRecordId}`)


    var updatedPrimaryRecords = [], updatedSecondaryRecords = [];
    if(otherPrimaryContactId.length > 0) {
        updatedPrimaryRecordsResult = await pool.query(
            "UPDATE public.contact SET linkedId=$1, linkPrecedence=$2 WHERE id in \( $3 \) RETURNING *"
            ,[primaryRecordId, "secondary", ...otherPrimaryContactId]);
    
        updatedSecondaryRecordsResult = await pool.query(
            "UPDATE public.contact SET linkedId=$1 where linkPrecedence=$2 and linkedId in \( $3 \) RETURNING *",
            [primaryRecordId, "secondary", ...otherPrimaryContactId]);

        updatedPrimaryRecords = updatedPrimaryRecordsResult.rows;
        updatedSecondaryRecords = updatedSecondaryRecordsResult.rows;
    }
 
    const newSecondaryContact = await createSecondaryContact(data, records[0]);

    const matchingRecords = [...newSecondaryContact, ...existingSecondaryRecords.rows, ...updatedPrimaryRecords, ...updatedSecondaryRecords];

    return consolidateLinkedContacts(matchingRecords)
}
 
const consolidateLinkedContacts = function(records) {

    const emailList = records.filter(record => record.email != null).map(record => record.email)
    const phoneNumberList = records.filter(record => record.phonenumber != null).map(record => record.phonenumber)
    const secondaryContactList = records.filter(record => record.linkprecedence === "secondary").map(record => record.id)
    
    const consolidatedContacts = {
        primaryContactId: records[0].id,
        emails: emailList,
        phoneNumbers: phoneNumberList,
        secondaryContactIds: secondaryContactList
    }
    return consolidatedContacts;
}
 
const fetchContacts = async function(email, phoneNumber) {
        return await pool.query(`SELECT * from public.contact where (email = '${email}' OR phoneNumber = '${phoneNumber}') AND deletedAt IS NULL ORDER BY createdAt`)
}

const getAllLinkedRecords = async function(primaryRecordId) {
    const results = await pool.query(`SELECT * FROM public.contact WHERE (id = '${primaryRecordId}' OR linkedId = '${primaryRecordId}') AND deletedAt IS NULL ORDER BY createdAt`)
    return results.rows
}

const getRecordById = async function(recordId) {
    const results = await pool.query(`SELECT * FROM public.contact WHERE id = '${primaryRecordId}' AND deletedAt IS NULL ORDER BY createdAt`)

    return results.rows[0] 
}

module.exports = {consolidateLinkedContacts, createNewContact, createSecondaryContact, fetchContacts, linkMatchingRecords, getAllLinkedRecords, getRecordById}